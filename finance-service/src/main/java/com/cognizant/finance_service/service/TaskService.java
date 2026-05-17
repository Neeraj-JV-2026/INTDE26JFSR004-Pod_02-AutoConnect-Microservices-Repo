package com.cognizant.finance_service.service;

import com.cognizant.finance_service.dto.TaskRequestDTO;
import com.cognizant.finance_service.entity.Task;
import com.cognizant.finance_service.exception.ResourceNotFoundException;
import com.cognizant.finance_service.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional
    public Task createTask(TaskRequestDTO dto) {
        Task task = Task.builder()
                .assignedTo(dto.getAssignedTo())
                .relatedEntityId(dto.getRelatedEntityId())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .status("PENDING")
                .build();
        return taskRepository.save(task);
    }

    public Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksForUser(Long userId) {
        return taskRepository.findByAssignedToOrderByCreatedAtDesc(userId);
    }

    public List<Task> getTasksForUserByStatus(Long userId, String status) {
        return taskRepository.findByAssignedToAndStatus(userId, status);
    }

    @Transactional
    public Task updateTaskStatus(Long id, String status) {
        Task task = getTask(id);
        task.setStatus(status);
        if ("COMPLETED".equals(status)) {
            task.setCompletedAt(LocalDateTime.now());
        }
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
