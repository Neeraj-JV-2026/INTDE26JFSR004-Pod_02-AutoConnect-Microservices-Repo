package com.cognizant.customer_service.controller;

import com.cognizant.customer_service.dto.LeadDTO;
import com.cognizant.customer_service.entity.Lead;
import com.cognizant.customer_service.service.LeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@Tag(name = "Leads", description = "Lead management and lifecycle APIs")
public class LeadController {
    private final LeadService leadService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'CUSTOMER')")
    @Operation(summary = "Create a new lead")
    public ResponseEntity<LeadDTO> createLead(@Valid @RequestBody LeadDTO dto) {
        Lead lead = mapToLeadEntity(dto);
        return new ResponseEntity<>(mapToLeadResponse(leadService.createLead(lead)), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'AUDITOR')")
    @Operation(summary = "Get lead by ID")
    public ResponseEntity<LeadDTO> getLeadById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToLeadResponse(leadService.getLeadById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'AUDITOR')")
    @Operation(summary = "Get all leads")
    public ResponseEntity<List<LeadDTO>> getAllLeads() {
        List<LeadDTO> list = leadService.getAllLeads().stream()
                .map(this::mapToLeadResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT', 'AUDITOR')")
    @Operation(summary = "Get all leads for a customer")
    public ResponseEntity<List<LeadDTO>> getLeadsByCustomer(@PathVariable Long customerId) {
        List<LeadDTO> list = leadService.getLeadsByCustomer(customerId).stream()
                .map(l -> mapToLeadResponse(l)).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Assign a lead to a sales consultant")
    public ResponseEntity<LeadDTO> assignLead(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(mapToLeadResponse(leadService.assignLead(id, userId)));
    }

    @PostMapping("/{id}/update-status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    @Operation(summary = "Update lead status")
    public ResponseEntity<LeadDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(mapToLeadResponse(leadService.updateStatus(id, status)));
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    @Operation(summary = "Convert lead to sale")
    public ResponseEntity<LeadDTO> convertLead(@PathVariable Long id) {
        return ResponseEntity.ok(mapToLeadResponse(leadService.convertLead(id)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SALES_CONSULTANT')")
    @Operation(summary = "Close a lead")
    public ResponseEntity<LeadDTO> closeLead(@PathVariable Long id) {
        return ResponseEntity.ok(mapToLeadResponse(leadService.closeLead(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Delete a lead")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    private Lead mapToLeadEntity(LeadDTO dto) {
        Lead l = new Lead();
        l.setCustomerId(dto.getCustomerId());
        l.setSource(dto.getSource());
        l.setInterestedModel(dto.getInterestedModel());
        l.setStatus(dto.getStatus());
        l.setAssignedTo(dto.getAssignedTo());
        l.setNotes(dto.getNotes());
        return l;
    }

    private LeadDTO mapToLeadResponse(Lead l) {
        return LeadDTO.builder()
                .leadId(l.getLeadId())
                .customerId(l.getCustomerId())
                .source(l.getSource())
                .interestedModel(l.getInterestedModel())
                .status(l.getStatus())
                .assignedTo(l.getAssignedTo())
                .createdAt(l.getCreatedAt())
                .notes(l.getNotes())
                .build();
    }
}
