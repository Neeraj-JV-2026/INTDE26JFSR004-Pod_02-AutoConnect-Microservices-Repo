package com.cognizant.finance_service.controller;

import com.cognizant.finance_service.dto.TaskRequestDTO;
import com.cognizant.finance_service.entity.Task;
import com.cognizant.finance_service.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management APIs")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'SERVICE_ADVISOR')")
    @Operation(summary = "Create a new task")
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'AUDITOR')")
    @Operation(summary = "Get all tasks (ADMIN / FINANCE_OFFICER only)")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'TECHNICIAN', 'SERVICE_ADVISOR')")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<Task> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'TECHNICIAN', 'SERVICE_ADVISOR')")
    @Operation(summary = "Get all tasks assigned to a user")
    public ResponseEntity<List<Task>> getTasksForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTasksForUser(userId));
    }

    @GetMapping("/user/{userId}/status/{status}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'TECHNICIAN', 'SERVICE_ADVISOR')")
    @Operation(summary = "Get tasks for a user filtered by status")
    public ResponseEntity<List<Task>> getTasksByUserAndStatus(
            @PathVariable Long userId, @PathVariable String status) {
        return ResponseEntity.ok(taskService.getTasksForUserByStatus(userId, status));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Update task status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('FINANCE_OFFICER', 'ADMIN')")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
