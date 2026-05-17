package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.ReportRequestDTO;
import com.cognizant.finance_service.entity.Report;
import com.cognizant.finance_service.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report management APIs")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Generate a report")
    public ResponseEntity<Report> generateReport(@RequestBody ReportRequestDTO dto) {
        Report report = Report.builder()
                .scope(parseScope(dto.getType()))
                .parametersJson(dto.getFilters())
                .generatedBy(dto.getGeneratedBy())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.generateReport(report));
    }

    private Report.ReportScope parseScope(String type) {
        if (type == null) return Report.ReportScope.FINANCE;
        try {
            return Report.ReportScope.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Map common aliases
            String t = type.toUpperCase();
            if (t.contains("SALES") || t.contains("REVENUE")) return Report.ReportScope.SALES;
            if (t.contains("SERVICE")) return Report.ReportScope.SERVICE;
            if (t.contains("PARTS")) return Report.ReportScope.PARTS;
            return Report.ReportScope.FINANCE;
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all reports")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get report by ID")
    public ResponseEntity<Report> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReport(id));
    }

    @GetMapping("/scope/{scope}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get reports by scope")
    public ResponseEntity<List<Report>> getReportsByScope(@PathVariable Report.ReportScope scope) {
        return ResponseEntity.ok(reportService.getReportsByScope(scope));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Delete a report")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
