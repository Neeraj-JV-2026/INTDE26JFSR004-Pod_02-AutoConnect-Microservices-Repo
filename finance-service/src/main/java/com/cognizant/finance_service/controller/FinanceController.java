package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.InvoiceRequestDTO;
import com.cognizant.finance_service.dto.InvoiceResponseDTO;
import com.cognizant.finance_service.dto.PaymentRequestDTO;
import com.cognizant.finance_service.dto.PaymentResponseDTO;
import com.cognizant.finance_service.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@Tag(name = "Finance", description = "Invoice and payment management APIs")
public class FinanceController {

    private final FinanceService financeService;

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'TECHNICIAN')")
    @Operation(summary = "Generate a new invoice")
    public ResponseEntity<InvoiceResponseDTO> generateInvoice(@Valid @RequestBody InvoiceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeService.generateInvoice(dto));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all invoices")
    public ResponseEntity<List<InvoiceResponseDTO>> getAllInvoices() {
        return ResponseEntity.ok(financeService.getAllInvoices());
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR', 'SALES_CONSULTANT')")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<InvoiceResponseDTO> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getInvoice(id));
    }

    @GetMapping("/invoices/customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR', 'SALES_CONSULTANT', 'CUSTOMER')")
    @Operation(summary = "Get invoices by customer ID")
    public ResponseEntity<List<InvoiceResponseDTO>> getInvoicesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(financeService.getInvoicesByCustomer(customerId));
    }

    @GetMapping("/invoices/status/{status}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get invoices by status")
    public ResponseEntity<List<InvoiceResponseDTO>> getInvoicesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(financeService.getInvoicesByStatus(status));
    }

    @PatchMapping("/invoices/{id}/status")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Update invoice status (ISSUED, PARTIAL, PAID, OVERDUE, CANCELLED)")
    public ResponseEntity<InvoiceResponseDTO> updateInvoiceStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(financeService.updateInvoiceStatus(id, status));
    }

    @PatchMapping("/invoices/{id}/amounts")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Update labor/parts amounts on an existing invoice (e.g. adjust auto-generated service invoice)")
    public ResponseEntity<InvoiceResponseDTO> updateInvoiceAmounts(
            @PathVariable Long id,
            @RequestParam java.math.BigDecimal subTotal,
            @RequestParam java.math.BigDecimal taxAmount) {
        return ResponseEntity.ok(financeService.updateInvoiceAmounts(id, subTotal, taxAmount));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Process a payment for an invoice")
    public ResponseEntity<PaymentResponseDTO> processPayment(@Valid @RequestBody PaymentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeService.processPayment(dto));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all payments")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        return ResponseEntity.ok(financeService.getAllPayments());
    }

    @GetMapping("/payments/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PaymentResponseDTO> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getPayment(id));
    }

    @GetMapping("/invoices/{id}/payments")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all payments for an invoice")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsForInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getPaymentsForInvoice(id));
    }
}
