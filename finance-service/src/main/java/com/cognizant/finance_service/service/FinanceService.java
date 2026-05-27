package com.cognizant.finance_service.service;

import com.cognizant.finance_service.client.CustomerFeignClient;
import com.cognizant.finance_service.client.NotificationFeignClient;
import com.cognizant.finance_service.dto.CustomerLookupDTO;
import com.cognizant.finance_service.dto.InvoiceRequestDTO;
import com.cognizant.finance_service.dto.InvoiceResponseDTO;
import com.cognizant.finance_service.dto.OutboundNotificationDTO;
import com.cognizant.finance_service.dto.PaymentRequestDTO;
import com.cognizant.finance_service.dto.PaymentResponseDTO;
import com.cognizant.finance_service.entity.Invoice;
import com.cognizant.finance_service.entity.Payment;
import com.cognizant.finance_service.exception.BadRequestException;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.InvoiceRepository;
import com.cognizant.finance_service.repository.PaymentRepository;
import com.cognizant.finance_service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceService {

    private static final Set<String> VALID_INVOICE_STATUSES =
            Set.of("ISSUED", "PARTIAL", "PAID", "OVERDUE", "CANCELLED");
    private static final Set<String> VALID_PAYMENT_METHODS =
            Set.of("CREDIT_CARD", "BANK_TRANSFER", "CASH", "FINANCING");

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationFeignClient notificationClient;
    private final CustomerFeignClient customerClient;
    private final SecurityUtils securityUtils;

    /**
     * Resolve the IAM userId for a CRM customer.
     * Falls back to the CRM customerId if the lookup fails (e.g. customer-service down).
     */
    private Long resolveIamUserId(Long customerId, String token) {
        try {
            CustomerLookupDTO cust = customerClient.getCustomer("Bearer " + token, customerId);
            return (cust != null && cust.getUserId() != null) ? cust.getUserId() : customerId;
        } catch (Exception e) {
            log.warn("Could not resolve IAM userId for customer {}: {}", customerId, e.getMessage());
            return customerId; // fallback — CRM and IAM IDs often coincide in dev environments
        }
    }

    @Transactional
    public InvoiceResponseDTO generateInvoice(InvoiceRequestDTO dto) {
        Invoice invoice = new Invoice();
        invoice.setCustomerId(dto.getCustomerId());
        invoice.setRelatedEntityType(dto.getRelatedEntityType() != null ? dto.getRelatedEntityType() : "SYSTEM");
        invoice.setRelatedEntityId(dto.getRelatedEntityId());
        invoice.setSubTotal(dto.getSubTotal());
        invoice.setTaxAmount(dto.getTaxAmount());
        invoice.setTotalAmount(dto.getSubTotal().add(dto.getTaxAmount()));
        invoice.setDueAt(dto.getDueAt() != null ? dto.getDueAt() : LocalDateTime.now().plusDays(30));
        invoice.setStatus("ISSUED");
        InvoiceResponseDTO saved = mapToInvoiceResponse(invoiceRepository.save(invoice));

        // Notify customer that their invoice has been issued
        try {
            String token = securityUtils.getCurrentJwtToken();
            Long iamUserId = resolveIamUserId(dto.getCustomerId(), token);
            notificationClient.sendNotification("Bearer " + token, OutboundNotificationDTO.builder()
                    .customerId(dto.getCustomerId())
                    .userId(iamUserId)
                    .channel("IN_APP")
                    .notificationType("INVOICE_ISSUED")
                    .subject("Invoice #" + saved.getInvoiceId() + " Issued")
                    .message("A new invoice of $" + saved.getTotalAmount()
                            + " has been issued for your account. Due date: " + saved.getDueAt() + ".")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send INVOICE_ISSUED notification for invoice {}: {}", saved.getInvoiceId(), e.getMessage());
        }

        return saved;
    }

    public InvoiceResponseDTO getInvoice(Long id) {
        return mapToInvoiceResponse(invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id)));
    }

    public List<InvoiceResponseDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponseDTO> getInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId).stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponseDTO> getInvoicesByStatus(String status) {
        validateInvoiceStatus(status);
        return invoiceRepository.findByStatus(status).stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Allows a Finance Officer to set the actual labor / parts amounts on an
     * auto-generated service invoice (which is created with an estimated figure
     * at job sign-off time and may need adjustment after final review).
     */
    @Transactional
    public InvoiceResponseDTO updateInvoiceAmounts(Long id,
                                                    java.math.BigDecimal subTotal,
                                                    java.math.BigDecimal taxAmount) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        if ("PAID".equals(invoice.getStatus()) || "CANCELLED".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot update amounts on a " + invoice.getStatus() + " invoice");
        }
        invoice.setSubTotal(subTotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(subTotal.add(taxAmount));
        return mapToInvoiceResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponseDTO updateInvoiceStatus(Long id, String status) {
        validateInvoiceStatus(status);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        if ("CANCELLED".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot update a cancelled invoice");
        }
        invoice.setStatus(status);
        InvoiceResponseDTO saved = mapToInvoiceResponse(invoiceRepository.save(invoice));

        // Notify customer if invoice becomes OVERDUE
        if ("OVERDUE".equals(status)) {
            try {
                String token = securityUtils.getCurrentJwtToken();
                Long iamUserId = resolveIamUserId(invoice.getCustomerId(), token);
                notificationClient.sendNotification("Bearer " + token, OutboundNotificationDTO.builder()
                        .customerId(invoice.getCustomerId())
                        .userId(iamUserId)
                        .channel("IN_APP")
                        .notificationType("INVOICE_OVERDUE")
                        .subject("Invoice #" + id + " is Overdue")
                        .message("Invoice #" + id + " of $" + invoice.getTotalAmount()
                                + " is now overdue. Please arrange payment immediately to avoid late fees.")
                        .build());
            } catch (Exception e) {
                log.warn("Failed to send INVOICE_OVERDUE notification for invoice {}: {}", id, e.getMessage());
            }
        }

        return saved;
    }

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO dto) {
        validatePaymentMethod(dto.getPaymentMethod());

        Invoice invoice = invoiceRepository.findById(dto.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + dto.getInvoiceId()));

        if ("CANCELLED".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot process payment for a cancelled invoice");
        }
        if ("PAID".equals(invoice.getStatus())) {
            throw new BadRequestException("Invoice is already fully paid");
        }

        Payment payment = new Payment();
        payment.setInvoiceId(dto.getInvoiceId());
        payment.setAmount(dto.getAmount());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setTransactionReference(dto.getTransactionReference());
        payment.setStatus("SUCCESS");

        Payment saved = paymentRepository.save(payment);

        invoice.setStatus("PAID");
        invoiceRepository.save(invoice);

        // Notify customer that payment was received
        try {
            String token = securityUtils.getCurrentJwtToken();
            Long iamUserId = resolveIamUserId(invoice.getCustomerId(), token);
            notificationClient.sendNotification("Bearer " + token, OutboundNotificationDTO.builder()
                    .customerId(invoice.getCustomerId())
                    .userId(iamUserId)
                    .channel("IN_APP")
                    .notificationType("PAYMENT_RECEIVED")
                    .subject("Payment Received — Invoice #" + dto.getInvoiceId())
                    .message("Your payment of $" + dto.getAmount()
                            + " via " + dto.getPaymentMethod()
                            + " for Invoice #" + dto.getInvoiceId()
                            + " has been received. Invoice is now PAID. Thank you!")
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send PAYMENT_RECEIVED notification for invoice {}: {}", dto.getInvoiceId(), e.getMessage());
        }

        return mapToPaymentResponse(saved);
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponseDTO getPayment(Long id) {
        return mapToPaymentResponse(paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id)));
    }

    public List<PaymentResponseDTO> getPaymentsForInvoice(Long invoiceId) {
        invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));
        return paymentRepository.findByInvoiceIdOrderByPaidAtDesc(invoiceId).stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    private void validateInvoiceStatus(String status) {
        if (!VALID_INVOICE_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid status. Allowed values: " + VALID_INVOICE_STATUSES);
        }
    }

    private void validatePaymentMethod(String method) {
        if (!VALID_PAYMENT_METHODS.contains(method)) {
            throw new BadRequestException("Invalid payment method. Allowed values: " + VALID_PAYMENT_METHODS);
        }
    }

    private InvoiceResponseDTO mapToInvoiceResponse(Invoice invoice) {
        return InvoiceResponseDTO.builder()
                .invoiceId(invoice.getInvoiceId())
                .customerId(invoice.getCustomerId())
                .relatedEntityType(invoice.getRelatedEntityType())
                .relatedEntityId(invoice.getRelatedEntityId())
                .subTotal(invoice.getSubTotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .issuedAt(invoice.getIssuedAt())
                .dueAt(invoice.getDueAt())
                .status(invoice.getStatus())
                .build();
    }

    private PaymentResponseDTO mapToPaymentResponse(Payment payment) {
        return PaymentResponseDTO.builder()
                .paymentId(payment.getPaymentId())
                .invoiceId(payment.getInvoiceId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .transactionReference(payment.getTransactionReference())
                .paidAt(payment.getPaidAt())
                .status(payment.getStatus())
                .build();
    }
}
