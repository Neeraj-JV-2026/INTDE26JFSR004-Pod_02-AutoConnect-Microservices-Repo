package com.cognizant.serviceparts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequestDTO {
    private String description;
    private Long assignedTo;
    private Long relatedEntityId;
    private LocalDateTime dueDate;
    private String priority;
}
