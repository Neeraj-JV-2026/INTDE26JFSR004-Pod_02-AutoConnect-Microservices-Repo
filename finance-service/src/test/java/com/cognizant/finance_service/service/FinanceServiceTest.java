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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FinanceService Unit Tests")
class FinanceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private FinanceService financeService;

    private Invoice sampleInvoice;

    @BeforeEach
    void setUp() {
        sampleInvoice = new Invoice();
        sampleInvoice.setInvoiceId(1L);
        sampleInvoice.setCustomerId(100L);
        sampleInvoice.setRelatedEntityType("SYSTEM");
        sampleInvoice.setSubTotal(new BigDecimal("900.00"));
        sampleInvoice.setTaxAmount(new BigDecimal("90.00"));
        sampleInvoice.setTotalAmount(new BigDecimal("990.00"));
        sampleInvoice.setStatus("ISSUED");
        sampleInvoice.setIssuedAt(LocalDateTime.now());
        sampleInvoice.setDueAt(LocalDateTime.now().plusDays(30));
    }

    // ---- generateInvoice ----

    @Test
    @DisplayName("generateInvoice: should calculate totalAmount as subTotal + taxAmount")
    void generateInvoice_shouldCalculateTotalCorrectly() {
        InvoiceRequestDTO dto = new InvoiceRequestDTO();
        dto.setCustomerId(100L);
        dto.setSubTotal(new BigDecimal("900.00"));
        dto.setTaxAmount(new BigDecimal("90.00"));

        when(invoiceRepository.save(any(Invoice.class))).thenReturn(sampleInvoice);

        InvoiceResponseDTO result = financeService.generateInvoice(dto);

        assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("990.00"));
        assertThat(result.getStatus()).isEqualTo("ISSUED");
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    @DisplayName("generateInvoice: should default relatedEntityType to SYSTEM when not provided")
    void generateInvoice_shouldDefaultEntityTypeToSystem() {
        InvoiceRequestDTO dto = new InvoiceRequestDTO();
        dto.setCustomerId(100L);
        dto.setSubTotal(new BigDecimal("500.00"));
        dto.setTaxAmount(new BigDecimal("50.00"));

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice saved = inv.getArgument(0);
            saved.setInvoiceId(1L);
            saved.setIssuedAt(LocalDateTime.now());
            return saved;
        });

        InvoiceResponseDTO result = financeService.generateInvoice(dto);

        assertThat(result.getRelatedEntityType()).isEqualTo("SYSTEM");
    }

    @Test
    @DisplayName("generateInvoice: should set dueAt 30 days from now when not provided")
    void generateInvoice_shouldSetDefaultDueDate() {
        InvoiceRequestDTO dto = new InvoiceRequestDTO();
        dto.setCustomerId(100L);
        dto.setSubTotal(BigDecimal.TEN);
        dto.setTaxAmount(BigDecimal.ONE);

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice saved = inv.getArgument(0);
            saved.setInvoiceId(1L);
            saved.setIssuedAt(LocalDateTime.now());
            return saved;
        });

        financeService.generateInvoice(dto);

        verify(invoiceRepository).save(argThat(inv ->
                inv.getDueAt() != null && inv.getDueAt().isAfter(LocalDateTime.now().plusDays(29))
        ));
    }

    // ---- getInvoice ----

    @Test
    @DisplayName("getInvoice: should return invoice when found")
    void getInvoice_shouldReturnInvoice() {
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));

        InvoiceResponseDTO result = financeService.getInvoice(1L);

        assertThat(result.getInvoiceId()).isEqualTo(1L);
        assertThat(result.getCustomerId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("getInvoice: should throw ResourceNotFoundException when not found")
    void getInvoice_shouldThrowWhenNotFound() {
        when(invoiceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> financeService.getInvoice(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ---- updateInvoiceStatus ----

    @Test
    @DisplayName("updateInvoiceStatus: should throw for invalid status value")
    void updateInvoiceStatus_shouldThrowForInvalidStatus() {
        assertThatThrownBy(() -> financeService.updateInvoiceStatus(1L, "PENDING"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status");
    }

    @Test
    @DisplayName("updateInvoiceStatus: should throw when invoice is already CANCELLED")
    void updateInvoiceStatus_shouldThrowForCancelledInvoice() {
        sampleInvoice.setStatus("CANCELLED");
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));

        assertThatThrownBy(() -> financeService.updateInvoiceStatus(1L, "PAID"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    @DisplayName("updateInvoiceStatus: should update and return updated invoice")
    void updateInvoiceStatus_shouldUpdateSuccessfully() {
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));
        when(invoiceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InvoiceResponseDTO result = financeService.updateInvoiceStatus(1L, "OVERDUE");

        assertThat(result.getStatus()).isEqualTo("OVERDUE");
    }

    // ---- processPayment ----

    @Test
    @DisplayName("processPayment: should succeed and mark invoice as PAID")
    void processPayment_shouldSucceedAndUpdateInvoice() {
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setInvoiceId(1L);
        dto.setAmount(new BigDecimal("990.00"));
        dto.setPaymentMethod("BANK_TRANSFER");

        Payment savedPayment = new Payment();
        savedPayment.setPaymentId(1L);
        savedPayment.setInvoiceId(1L);
        savedPayment.setAmount(new BigDecimal("990.00"));
        savedPayment.setPaymentMethod("BANK_TRANSFER");
        savedPayment.setStatus("SUCCESS");
        savedPayment.setPaidAt(LocalDateTime.now());

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));
        when(paymentRepository.save(any())).thenReturn(savedPayment);
        when(invoiceRepository.save(any())).thenReturn(sampleInvoice);

        PaymentResponseDTO result = financeService.processPayment(dto);

        assertThat(result.getStatus()).isEqualTo("SUCCESS");
        verify(invoiceRepository).save(argThat(inv -> "PAID".equals(inv.getStatus())));
    }

    @Test
    @DisplayName("processPayment: should throw BadRequestException for invalid payment method")
    void processPayment_shouldThrowForInvalidPaymentMethod() {
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setInvoiceId(1L);
        dto.setAmount(new BigDecimal("100.00"));
        dto.setPaymentMethod("CRYPTO");

        assertThatThrownBy(() -> financeService.processPayment(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid payment method");
    }

    @Test
    @DisplayName("processPayment: should throw when invoice is CANCELLED")
    void processPayment_shouldThrowForCancelledInvoice() {
        sampleInvoice.setStatus("CANCELLED");
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setInvoiceId(1L);
        dto.setAmount(new BigDecimal("100.00"));
        dto.setPaymentMethod("CASH");

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));

        assertThatThrownBy(() -> financeService.processPayment(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    @DisplayName("processPayment: should throw when invoice is already PAID")
    void processPayment_shouldThrowForAlreadyPaidInvoice() {
        sampleInvoice.setStatus("PAID");
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setInvoiceId(1L);
        dto.setAmount(new BigDecimal("100.00"));
        dto.setPaymentMethod("CASH");

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(sampleInvoice));

        assertThatThrownBy(() -> financeService.processPayment(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already fully paid");
    }

    // ---- getAllInvoices / getInvoicesByCustomer ----

    @Test
    @DisplayName("getAllInvoices: should return all invoices mapped to DTOs")
    void getAllInvoices_shouldReturnMappedList() {
        when(invoiceRepository.findAll()).thenReturn(List.of(sampleInvoice));

        List<InvoiceResponseDTO> result = financeService.getAllInvoices();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInvoiceId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getInvoicesByCustomer: should return invoices for given customerId")
    void getInvoicesByCustomer_shouldReturnFiltered() {
        when(invoiceRepository.findByCustomerId(100L)).thenReturn(List.of(sampleInvoice));

        List<InvoiceResponseDTO> result = financeService.getInvoicesByCustomer(100L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCustomerId()).isEqualTo(100L);
    }
}
