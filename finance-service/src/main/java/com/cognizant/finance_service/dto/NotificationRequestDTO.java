package com.cognizant.finance_service.dto;

import com.cognizant.finance_service.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long relatedEntityId;

    @NotBlank(message = "Message is required")
    private String message;

    private Notification.NotificationCategory category;
    private Notification.Severity severity;
}
