package com.cognizant.notification_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Inbound DTO for creating a notification.
 * Used by other microservices (sales, finance, service) to
 * request that a notification be dispatched to a user.
 */
@Data
public class NotificationRequestDTO {

    @NotNull(message = "userId is required")
    private Long userId;

    /** Optional — set if this notification is related to a CRM customer */
    private Long customerId;

    /**
     * Delivery channel: EMAIL | SMS | PUSH | IN_APP
     * Defaults to IN_APP if omitted.
     */
    @NotBlank(message = "channel is required (EMAIL, SMS, PUSH, IN_APP)")
    private String channel;

    /**
     * Business event type, e.g.:
     * DEAL_FINALIZED, INVOICE_OVERDUE, APPOINTMENT_REMINDER,
     * RECALL_ALERT, PAYMENT_RECEIVED, COMMISSION_READY, SERVICE_COMPLETE,
     * WELCOME, PASSWORD_RESET, GENERAL
     */
    @NotBlank(message = "notificationType is required")
    private String notificationType;

    /** Email subject line or push notification title */
    private String subject;

    @NotBlank(message = "message body is required")
    private String message;

    /**
     * Optional JSON string with context data for deep-link routing.
     * Example: {"invoiceId":12, "dealId":5}
     */
    private String metadata;
}
