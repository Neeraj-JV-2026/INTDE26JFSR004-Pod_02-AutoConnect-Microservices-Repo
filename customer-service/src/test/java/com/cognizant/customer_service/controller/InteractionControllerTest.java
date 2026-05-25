package com.cognizant.customer_service.controller;

import com.cognizant.customer_service.dto.InteractionDTO;
import com.cognizant.customer_service.entity.Interaction;
import com.cognizant.customer_service.exception.GlobalExceptionHandler;
import com.cognizant.customer_service.service.InteractionService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InteractionControllerTest {

    @Mock
    private InteractionService interactionService;

    @InjectMocks
    private InteractionController interactionController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    private Interaction sample;
    private InteractionDTO validRequest;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(interactionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sample = new Interaction();
        sample.setInteractionId(1L);
        sample.setCustomerId(10L);
        sample.setUserId(2L);
        sample.setChannel("CALL");
        sample.setMessage("Discussed pricing options.");
        sample.setOutcome("FOLLOW_UP");
        sample.setTimestamp(LocalDateTime.now());

        validRequest = new InteractionDTO();
        validRequest.setCustomerId(10L);
        validRequest.setUserId(2L);
        validRequest.setChannel("CALL");
        validRequest.setMessage("Discussed pricing options.");
        validRequest.setOutcome("FOLLOW_UP");
    }

    @Test
    void logInteraction_validRequest_returns201() throws Exception {
        when(interactionService.logInteraction(any(Interaction.class))).thenReturn(sample);

        mockMvc.perform(post("/api/interactions/log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.interactionId").value(1))
                .andExpect(jsonPath("$.channel").value("CALL"))
                .andExpect(jsonPath("$.outcome").value("FOLLOW_UP"));
    }

    @Test
    void logInteraction_missingCustomerId_returns400() throws Exception {
        validRequest.setCustomerId(null);

        mockMvc.perform(post("/api/interactions/log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void logInteraction_missingMessage_returns400() throws Exception {
        validRequest.setMessage("");

        mockMvc.perform(post("/api/interactions/log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logInteraction_invalidChannel_returns400() throws Exception {
        validRequest.setChannel("FAX");

        mockMvc.perform(post("/api/interactions/log")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getInteractionsByCustomer_returns200WithList() throws Exception {
        when(interactionService.getInteractionsByCustomer(10L)).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/interactions/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(10))
                .andExpect(jsonPath("$[0].channel").value("CALL"));
    }

    @Test
    void getInteractionsByCustomer_noInteractions_returnsEmptyList() throws Exception {
        when(interactionService.getInteractionsByCustomer(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/interactions/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
