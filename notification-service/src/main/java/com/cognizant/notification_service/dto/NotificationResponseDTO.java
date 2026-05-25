package com.cognizant.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Outbound DTO returned to callers after a notification is created or queried.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private Long notificationId;
    private Long userId;
    private Long customerId;
    private String channel;
    private String notificationType;
    private String subject;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private String metadata;
    private Integer retryCount;
}
