package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.NotificationRequestDTO;
import com.cognizant.finance_service.entity.Notification;
import com.cognizant.finance_service.exception.GlobalExceptionHandler;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.service.NotificationService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationController Tests")
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        mockMvc = MockMvcBuilders
                .standaloneSetup(notificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private Notification buildSampleNotification() {
        return Notification.builder()
                .notificationId(1L)
                .userId(10L)
                .message("Your invoice #1 is ready.")
                .category(Notification.NotificationCategory.FINANCE)
                .severity(Notification.Severity.INFO)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ---- POST /api/finance/notifications ----

    @Test
    @DisplayName("POST /notifications: should return 201 with valid request")
    void sendNotification_shouldReturn201() throws Exception {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(10L);
        dto.setMessage("Your invoice #1 is ready.");
        dto.setCategory(Notification.NotificationCategory.FINANCE);

        when(notificationService.sendNotification(any())).thenReturn(buildSampleNotification());

        mockMvc.perform(post("/api/finance/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.notificationId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /notifications: should return 400 when message is blank")
    void sendNotification_shouldReturn400WhenMessageBlank() throws Exception {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(10L);
        dto.setMessage("");

        mockMvc.perform(post("/api/finance/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // ---- GET /api/finance/notifications/user/{userId} ----

    @Test
    @DisplayName("GET /notifications/user/{userId}: should return list of notifications")
    void getUserNotifications_shouldReturn200() throws Exception {
        when(notificationService.getUserNotifications(10L))
                .thenReturn(List.of(buildSampleNotification()));

        mockMvc.perform(get("/api/finance/notifications/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].userId").value(10));
    }

    // ---- PATCH /api/finance/notifications/{id}/read ----

    @Test
    @DisplayName("PATCH /notifications/{id}/read: should return notification marked as read")
    void markAsRead_shouldReturn200() throws Exception {
        Notification read = buildSampleNotification();
        read.setStatus("READ");

        when(notificationService.markAsRead(1L)).thenReturn(read);

        mockMvc.perform(patch("/api/finance/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));
    }

    // ---- DELETE /api/finance/notifications/{id} ----

    @Test
    @DisplayName("DELETE /notifications/{id}: should return 204 on success")
    void deleteNotification_shouldReturn204() throws Exception {
        doNothing().when(notificationService).deleteNotification(1L);

        mockMvc.perform(delete("/api/finance/notifications/1"))
                .andExpect(status().isNoContent());
    }
}
