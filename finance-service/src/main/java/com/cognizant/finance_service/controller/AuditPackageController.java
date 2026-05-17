package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.AuditPackageRequestDTO;
import com.cognizant.finance_service.dto.AuditPackageResponseDTO;
import com.cognizant.finance_service.service.AuditPackageService;
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
@RequestMapping("/api/finance/audit-packages")
@RequiredArgsConstructor
@Tag(name = "Audit Packages", description = "Evidence capture and exportable audit package management")
public class AuditPackageController {

    private final AuditPackageService auditPackageService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Generate a new audit package for a reporting period")
    public ResponseEntity<AuditPackageResponseDTO> generatePackage(
            @Valid @RequestBody AuditPackageRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(auditPackageService.generatePackage(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "List all audit packages")
    public ResponseEntity<List<AuditPackageResponseDTO>> getAllPackages() {
        return ResponseEntity.ok(auditPackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get an audit package by ID")
    public ResponseEntity<AuditPackageResponseDTO> getPackage(@PathVariable Long id) {
        return ResponseEntity.ok(auditPackageService.getPackage(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete an audit package (ADMIN only)")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        auditPackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
