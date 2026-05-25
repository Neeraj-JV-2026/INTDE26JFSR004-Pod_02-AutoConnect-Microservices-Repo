package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.TaskRequestDTO;
import com.cognizant.finance_service.entity.Task;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = Task.builder()
                .taskId(1L)
                .description("Follow up on Invoice #1")
                .assignedTo(5L)
                .relatedEntityId(101L)
                .dueDate(LocalDateTime.now().plusDays(3))
                .priority("HIGH")
                .status("PENDING")
                .build();
    }

    @Test
    @DisplayName("createTask: should set status to PENDING and save")
    void createTask_shouldSetStatusToPending() {
        TaskRequestDTO dto = new TaskRequestDTO();
        dto.setDescription("Follow up on Invoice #1");
        dto.setAssignedTo(5L);

        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        Task result = taskService.createTask(dto);

        assertThat(result.getStatus()).isEqualTo("PENDING");
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("getTask: should return task when found")
    void getTask_shouldReturnTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        Task result = taskService.getTask(1L);

        assertThat(result.getTaskId()).isEqualTo(1L);
        assertThat(result.getDescription()).isEqualTo("Follow up on Invoice #1");
    }

    @Test
    @DisplayName("getTask: should throw ResourceNotFoundException when not found")
    void getTask_shouldThrowWhenNotFound() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTask(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("getTasksForUser: should return all tasks for given user")
    void getTasksForUser_shouldReturnUserTasks() {
        when(taskRepository.findByAssignedToOrderByCreatedAtDesc(5L)).thenReturn(List.of(sampleTask));

        List<Task> result = taskService.getTasksForUser(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAssignedTo()).isEqualTo(5L);
    }

    @Test
    @DisplayName("updateTaskStatus: should update to valid new status")
    void updateTaskStatus_shouldUpdateSuccessfully() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Task result = taskService.updateTaskStatus(1L, "IN_PROGRESS");

        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    @DisplayName("deleteTask: should delete existing task")
    void deleteTask_shouldDeleteSuccessfully() {
        taskService.deleteTask(1L);
        verify(taskRepository).deleteById(1L);
    }
}
