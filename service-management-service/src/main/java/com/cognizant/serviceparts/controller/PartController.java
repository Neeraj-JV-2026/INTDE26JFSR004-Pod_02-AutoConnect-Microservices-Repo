package com.cognizant.serviceparts.controller;

import com.cognizant.serviceparts.dto.ApiResponse;
import com.cognizant.serviceparts.dto.PartConsumeRequest;
import com.cognizant.serviceparts.entity.PartConsumption;
import com.cognizant.serviceparts.service.PartsManagement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartsManagement partsManagement;

    @PostMapping("/{id}/consume")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<PartConsumption>> consumePart(
            @PathVariable Long id,
            @Valid @RequestBody PartConsumeRequest request) {
        PartConsumption consumption = partsManagement.consumePart(id, request);
        return ResponseEntity.ok(ApiResponse.success("Parts consumed successfully", consumption));
    }

    @GetMapping("/{id}/consumptions")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'SERVICE_ADVISOR', 'PARTS_MANAGER', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<ApiResponse<List<PartConsumption>>> getConsumptionsByPart(
            @PathVariable Long id) {
        List<PartConsumption> consumptions = partsManagement.getConsumptionsByPart(id);
        return ResponseEntity.ok(ApiResponse.success(consumptions));
    }

    @GetMapping("/consumptions/jobcard/{jobCardId}")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'SERVICE_ADVISOR', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<ApiResponse<List<PartConsumption>>> getConsumptionsByJobCard(
            @PathVariable Long jobCardId) {
        List<PartConsumption> consumptions = partsManagement.getConsumptionsByJobCard(jobCardId);
        return ResponseEntity.ok(ApiResponse.success(consumptions));
    }
}
