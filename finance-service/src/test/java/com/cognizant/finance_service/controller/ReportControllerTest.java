package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.entity.Report;
import com.cognizant.finance_service.exception.GlobalExceptionHandler;
import com.cognizant.finance_service.service.ReportService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportController Tests")
class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        mockMvc = MockMvcBuilders
                .standaloneSetup(reportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private Report buildSampleReport() {
        return Report.builder()
                .reportId(1L)
                .scope(Report.ReportScope.SALES)
                .reportUri("/reports/download/sales-123")
                .build();
    }

    @Test
    @DisplayName("POST /reports: should return 201")
    void generateReport_shouldReturn201() throws Exception {
        Report report = Report.builder().scope(Report.ReportScope.SALES).build();

        when(reportService.generateReport(any())).thenReturn(buildSampleReport());

        mockMvc.perform(post("/api/finance/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(report)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reportId").value(1));
    }

    @Test
    @DisplayName("GET /reports: should return 200")
    void getAllReports_shouldReturn200() throws Exception {
        when(reportService.getAllReports()).thenReturn(List.of(buildSampleReport()));

        mockMvc.perform(get("/api/finance/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /reports/scope/{scope}: should return filtered list")
    void getReportsByScope_shouldReturn200() throws Exception {
        when(reportService.getReportsByScope(Report.ReportScope.SALES)).thenReturn(List.of(buildSampleReport()));

        mockMvc.perform(get("/api/finance/reports/scope/SALES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].scope").value("SALES"));
    }
}
