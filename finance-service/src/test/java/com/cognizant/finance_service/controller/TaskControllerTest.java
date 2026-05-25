package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.TaskRequestDTO;
import com.cognizant.finance_service.entity.Task;
import com.cognizant.finance_service.exception.GlobalExceptionHandler;
import com.cognizant.finance_service.service.TaskService;
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
@DisplayName("TaskController Tests")
class TaskControllerTest {

    @Mock
    private TaskService taskService;

    @InjectMocks
    private TaskController taskController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        mockMvc = MockMvcBuilders
                .standaloneSetup(taskController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private Task buildSampleTask() {
        return Task.builder()
                .taskId(1L)
                .description("Follow up on Invoice #1")
                .assignedTo(5L)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("POST /tasks: should return 201 with valid request")
    void createTask_shouldReturn201() throws Exception {
        TaskRequestDTO dto = new TaskRequestDTO();
        dto.setDescription("Follow up on Invoice #1");
        dto.setAssignedTo(5L);

        when(taskService.createTask(any())).thenReturn(buildSampleTask());

        mockMvc.perform(post("/api/finance/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.taskId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /tasks/{id}: should return 200")
    void getTask_shouldReturn200() throws Exception {
        when(taskService.getTask(1L)).thenReturn(buildSampleTask());

        mockMvc.perform(get("/api/finance/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskId").value(1));
    }

    @Test
    @DisplayName("GET /tasks/user/{userId}: should return list")
    void getTasksForUser_shouldReturn200() throws Exception {
        when(taskService.getTasksForUser(5L)).thenReturn(List.of(buildSampleTask()));

        mockMvc.perform(get("/api/finance/tasks/user/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("DELETE /tasks/{id}: should return 204")
    void deleteTask_shouldReturn204() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/finance/tasks/1"))
                .andExpect(status().isNoContent());
    }
}
