package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.InvoiceRequestDTO;
import com.cognizant.finance_service.dto.InvoiceResponseDTO;
import com.cognizant.finance_service.dto.PaymentRequestDTO;
import com.cognizant.finance_service.dto.PaymentResponseDTO;
import com.cognizant.finance_service.exception.GlobalExceptionHandler;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.service.FinanceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FinanceController Tests")
class FinanceControllerTest {

    @Mock
    private FinanceService financeService;

    @InjectMocks
    private FinanceController financeController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        mockMvc = MockMvcBuilders
                .standaloneSetup(financeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private InvoiceResponseDTO buildSampleInvoice() {
        return InvoiceResponseDTO.builder()
                .invoiceId(1L)
                .customerId(100L)
                .relatedEntityType("SYSTEM")
                .subTotal(new BigDecimal("900.00"))
                .taxAmount(new BigDecimal("90.00"))
                .totalAmount(new BigDecimal("990.00"))
                .issuedAt(LocalDateTime.now())
                .dueAt(LocalDateTime.now().plusDays(30))
                .status("ISSUED")
                .build();
    }

    // ---- POST /api/finance/invoices ----

    @Test
    @DisplayName("POST /invoices: should return 201 with valid request")
    void generateInvoice_shouldReturn201() throws Exception {
        InvoiceRequestDTO dto = new InvoiceRequestDTO();
        dto.setCustomerId(100L);
        dto.setSubTotal(new BigDecimal("900.00"));
        dto.setTaxAmount(new BigDecimal("90.00"));

        when(financeService.generateInvoice(any())).thenReturn(buildSampleInvoice());

        mockMvc.perform(post("/api/finance/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceId").value(1))
                .andExpect(jsonPath("$.status").value("ISSUED"))
                .andExpect(jsonPath("$.totalAmount").value(990.00));
    }

    @Test
    @DisplayName("POST /invoices: should return 400 when customerId is missing")
    void generateInvoice_shouldReturn400WhenCustomerIdMissing() throws Exception {
        InvoiceRequestDTO dto = new InvoiceRequestDTO();
        dto.setSubTotal(new BigDecimal("900.00"));
        dto.setTaxAmount(new BigDecimal("90.00"));

        mockMvc.perform(post("/api/finance/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /invoices: should return 400 when subTotal is negative")
    void generateInvoice_shouldReturn400WhenSubTotalNegative() throws Exception {
        InvoiceRequestDTO dto = new InvoiceRequestDTO();
        dto.setCustomerId(100L);
        dto.setSubTotal(new BigDecimal("-50.00"));
        dto.setTaxAmount(new BigDecimal("10.00"));

        mockMvc.perform(post("/api/finance/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // ---- GET /api/finance/invoices ----

    @Test
    @DisplayName("GET /invoices: should return 200 with list of invoices")
    void getAllInvoices_shouldReturn200() throws Exception {
        when(financeService.getAllInvoices()).thenReturn(List.of(buildSampleInvoice()));

        mockMvc.perform(get("/api/finance/invoices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].invoiceId").value(1));
    }

    // ---- GET /api/finance/invoices/{id} ----

    @Test
    @DisplayName("GET /invoices/{id}: should return 200 for existing invoice")
    void getInvoice_shouldReturn200() throws Exception {
        when(financeService.getInvoice(1L)).thenReturn(buildSampleInvoice());

        mockMvc.perform(get("/api/finance/invoices/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceId").value(1));
    }

    @Test
    @DisplayName("GET /invoices/{id}: should return 404 for missing invoice")
    void getInvoice_shouldReturn404() throws Exception {
        when(financeService.getInvoice(99L))
                .thenThrow(new ResourceNotFoundException("Invoice not found with id: 99"));

        mockMvc.perform(get("/api/finance/invoices/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Invoice not found with id: 99"));
    }

    // ---- POST /api/finance/payments ----

    @Test
    @DisplayName("POST /payments: should return 201 with valid payment request")
    void processPayment_shouldReturn201() throws Exception {
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setInvoiceId(1L);
        dto.setAmount(new BigDecimal("990.00"));
        dto.setPaymentMethod("BANK_TRANSFER");

        PaymentResponseDTO response = PaymentResponseDTO.builder()
                .paymentId(1L)
                .invoiceId(1L)
                .amount(new BigDecimal("990.00"))
                .paymentMethod("BANK_TRANSFER")
                .status("SUCCESS")
                .paidAt(LocalDateTime.now())
                .build();

        when(financeService.processPayment(any())).thenReturn(response);

        mockMvc.perform(post("/api/finance/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.paymentMethod").value("BANK_TRANSFER"));
    }

    @Test
    @DisplayName("POST /payments: should return 400 when amount is missing")
    void processPayment_shouldReturn400WhenAmountMissing() throws Exception {
        PaymentRequestDTO dto = new PaymentRequestDTO();
        dto.setInvoiceId(1L);
        dto.setPaymentMethod("CASH");

        mockMvc.perform(post("/api/finance/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // ---- PATCH /api/finance/invoices/{id}/status ----

    @Test
    @DisplayName("PATCH /invoices/{id}/status: should return updated invoice")
    void updateInvoiceStatus_shouldReturn200() throws Exception {
        InvoiceResponseDTO updated = buildSampleInvoice();
        updated.setStatus("CANCELLED");

        when(financeService.updateInvoiceStatus(eq(1L), eq("CANCELLED"))).thenReturn(updated);

        mockMvc.perform(patch("/api/finance/invoices/1/status")
                        .param("status", "CANCELLED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ---- GET /api/finance/invoices/customer/{customerId} ----

    @Test
    @DisplayName("GET /invoices/customer/{id}: should return invoices for customer")
    void getInvoicesByCustomer_shouldReturn200() throws Exception {
        when(financeService.getInvoicesByCustomer(100L)).thenReturn(List.of(buildSampleInvoice()));

        mockMvc.perform(get("/api/finance/invoices/customer/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(100));
    }
}
