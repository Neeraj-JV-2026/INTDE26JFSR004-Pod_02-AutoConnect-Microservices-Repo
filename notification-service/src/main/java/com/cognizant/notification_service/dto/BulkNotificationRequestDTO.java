package com.cognizant.notification_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Bulk notification request — send the same message to multiple users.
 * Used for broadcast events such as recall alerts or system-wide announcements.
 */
@Data
public class BulkNotificationRequestDTO {

    @NotEmpty(message = "At least one userId must be provided")
    private List<Long> userIds;

    /** Optional: broadcast to all users with a specific role, e.g. CUSTOMER */
    private String targetRole;

    private String channel;
    private String notificationType;
    private String subject;
    private String message;
    private String metadata;
}
