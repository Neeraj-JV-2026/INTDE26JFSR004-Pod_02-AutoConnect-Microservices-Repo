package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.InvoiceRequestDTO;
import com.cognizant.finance_service.dto.InvoiceResponseDTO;
import com.cognizant.finance_service.dto.PaymentRequestDTO;
import com.cognizant.finance_service.dto.PaymentResponseDTO;
import com.cognizant.finance_service.entity.Invoice;
import com.cognizant.finance_service.entity.Payment;
import com.cognizant.finance_service.exception.BadRequestException;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.InvoiceRepository;
import com.cognizant.finance_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private static final Set<String> VALID_INVOICE_STATUSES =
            Set.of("ISSUED", "PARTIAL", "PAID", "OVERDUE", "CANCELLED");
    private static final Set<String> VALID_PAYMENT_METHODS =
            Set.of("CREDIT_CARD", "BANK_TRANSFER", "CASH", "FINANCING");

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

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
        return mapToInvoiceResponse(invoiceRepository.save(invoice));
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

    @Transactional
    public InvoiceResponseDTO updateInvoiceStatus(Long id, String status) {
        validateInvoiceStatus(status);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        if ("CANCELLED".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot update a cancelled invoice");
        }
        invoice.setStatus(status);
        return mapToInvoiceResponse(invoiceRepository.save(invoice));
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
