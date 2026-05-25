package com.cognizant.finance_service.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskRequestDTO {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Assigned user ID is required")
    private Long assignedTo;

    private Long relatedEntityId;

    @Future(message = "Due date must be in the future")
    private LocalDateTime dueDate;

    private String priority; // LOW, MEDIUM, HIGH, URGENT
}
