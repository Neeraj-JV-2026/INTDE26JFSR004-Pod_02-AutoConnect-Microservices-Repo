package com.cognizant.customer_service.controller;

import com.cognizant.customer_service.dto.LeadDTO;
import com.cognizant.customer_service.entity.Lead;
import com.cognizant.customer_service.exception.GlobalExceptionHandler;
import com.cognizant.customer_service.exception.InvalidLeadStateException;
import com.cognizant.customer_service.exception.ResourceNotFoundException;
import com.cognizant.customer_service.service.LeadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class LeadControllerTest {

    @Mock
    private LeadService leadService;

    @InjectMocks
    private LeadController leadController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    private Lead sampleLead;
    private LeadDTO validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(leadController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleLead = new Lead();
        sampleLead.setLeadId(1L);
        sampleLead.setCustomerId(10L);
        sampleLead.setSource("WEBSITE");
        sampleLead.setInterestedModel("Honda CR-V");
        sampleLead.setStatus("NEW");
        sampleLead.setCreatedAt(LocalDateTime.now());

        validRequest = new LeadDTO();
        validRequest.setCustomerId(10L);
        validRequest.setSource("WEBSITE");
        validRequest.setInterestedModel("Honda CR-V");
    }

    @Test
    void createLead_validRequest_returns201() throws Exception {
        when(leadService.createLead(any(Lead.class))).thenReturn(sampleLead);

        mockMvc.perform(post("/api/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.leadId").value(1))
                .andExpect(jsonPath("$.source").value("WEBSITE"));
    }

    @Test
    void createLead_missingCustomerId_returns400() throws Exception {
        validRequest.setCustomerId(null);

        mockMvc.perform(post("/api/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void createLead_missingSource_returns400() throws Exception {
        validRequest.setSource(null);

        mockMvc.perform(post("/api/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getLeadById_found_returns200() throws Exception {
        when(leadService.getLeadById(1L)).thenReturn(sampleLead);

        mockMvc.perform(get("/api/leads/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leadId").value(1))
                .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    void getLeadById_notFound_returns404() throws Exception {
        when(leadService.getLeadById(99L))
                .thenThrow(new ResourceNotFoundException("Lead not found: 99"));

        mockMvc.perform(get("/api/leads/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void getLeadsByCustomer_returns200() throws Exception {
        when(leadService.getLeadsByCustomer(10L)).thenReturn(List.of(sampleLead));

        mockMvc.perform(get("/api/leads/customer/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(10));
    }

    @Test
    void assignLead_returns200() throws Exception {
        sampleLead.setAssignedTo(5L);
        when(leadService.assignLead(1L, 5L)).thenReturn(sampleLead);

        mockMvc.perform(post("/api/leads/1/assign").param("userId", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedTo").value(5));
    }

    @Test
    void updateStatus_unassignedLead_returns400() throws Exception {
        when(leadService.updateStatus(1L, "CONTACTED"))
                .thenThrow(new InvalidLeadStateException("Lead must be assigned before updating status"));

        mockMvc.perform(post("/api/leads/1/update-status").param("status", "CONTACTED"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid Lead State"));
    }

    @Test
    void convertLead_returns200() throws Exception {
        sampleLead.setStatus("CONVERTED");
        when(leadService.convertLead(1L)).thenReturn(sampleLead);

        mockMvc.perform(post("/api/leads/1/convert"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONVERTED"));
    }

    @Test
    void deleteLead_returns204() throws Exception {
        doNothing().when(leadService).deleteLead(1L);

        mockMvc.perform(delete("/api/leads/1"))
                .andExpect(status().isNoContent());
    }
}
