package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.ReconciliationRequestDTO;
import com.cognizant.finance_service.dto.ReconciliationResponseDTO;
import com.cognizant.finance_service.service.ReconciliationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance/reconciliation")
@RequiredArgsConstructor
@Tag(name = "Reconciliation", description = "Period-end financial reconciliation — FINANCE_OFFICER only")
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    @PostMapping("/run")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Run final period reconciliation. Requires FINANCE_OFFICER role. "
            + "Validates that invoices exist in the period, computes totals, and seals an AuditPackage.")
    public ResponseEntity<ReconciliationResponseDTO> runReconciliation(
            @Valid @RequestBody ReconciliationRequestDTO request) {
        return ResponseEntity.ok(reconciliationService.reconcile(request));
    }
}
