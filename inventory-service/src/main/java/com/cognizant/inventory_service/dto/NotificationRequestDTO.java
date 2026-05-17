package com.cognizant.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {
    private Long userId;
    private Long relatedEntityId;
    private String message;
    private String category; // APPOINTMENT, PARTS, FINANCE, RECALL, SYSTEM
    private String severity; // INFO, WARNING, CRITICAL
}
