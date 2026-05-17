package com.cognizant.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponseDTO {
    private Long taskId;
    private String title;
    private String description;
    private Long assignedTo;
    private String entityType;
    private Long entityId;
    private LocalDateTime dueAt;
    private String status;
}
