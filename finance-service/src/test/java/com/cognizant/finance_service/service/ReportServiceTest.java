package com.cognizant.finance_service.service;

import com.cognizant.finance_service.entity.Report;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService Unit Tests")
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportService reportService;

    private Report sampleReport;

    @BeforeEach
    void setUp() {
        sampleReport = Report.builder()
                .reportId(1L)
                .scope(Report.ReportScope.SALES)
                .parametersJson(Map.of("quarter", "Q1", "year", 2024))
                .reportUri("/reports/download/sales-12345")
                .generatedAt(LocalDateTime.now())
                .generatedBy(1L)
                .build();
    }

    @Test
    @DisplayName("generateReport: should create report with generated reportUri")
    void generateReport_shouldCreateWithReportUri() {
        Report report = Report.builder()
                .scope(Report.ReportScope.SALES)
                .generatedBy(1L)
                .build();

        when(reportRepository.save(any(Report.class))).thenReturn(sampleReport);

        Report result = reportService.generateReport(report);

        assertThat(result.getReportUri()).startsWith("/reports/download/sales-");
        verify(reportRepository).save(any(Report.class));
    }

    @Test
    @DisplayName("getReport: should return report when found")
    void getReport_shouldReturnReport() {
        when(reportRepository.findById(1L)).thenReturn(Optional.of(sampleReport));

        Report result = reportService.getReport(1L);

        assertThat(result.getReportId()).isEqualTo(1L);
        assertThat(result.getScope()).isEqualTo(Report.ReportScope.SALES);
    }

    @Test
    @DisplayName("getReport: should throw ResourceNotFoundException when not found")
    void getReport_shouldThrowWhenNotFound() {
        when(reportRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.getReport(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("getAllReports: should return all reports")
    void getAllReports_shouldReturnAll() {
        when(reportRepository.findAll()).thenReturn(List.of(sampleReport));

        List<Report> result = reportService.getAllReports();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getReportsByScope: should return reports filtered by scope")
    void getReportsByScope_shouldReturnFiltered() {
        when(reportRepository.findByScopeOrderByGeneratedAtDesc(Report.ReportScope.FINANCE)).thenReturn(List.of(sampleReport));

        List<Report> result = reportService.getReportsByScope(Report.ReportScope.FINANCE);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("deleteReport: should delete existing report")
    void deleteReport_shouldDeleteSuccessfully() {
        when(reportRepository.existsById(1L)).thenReturn(true);

        reportService.deleteReport(1L);

        verify(reportRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteReport: should throw ResourceNotFoundException when not found")
    void deleteReport_shouldThrowWhenNotFound() {
        when(reportRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> reportService.deleteReport(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(reportRepository, never()).deleteById(any());
    }
}
