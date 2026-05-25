package com.cognizant.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for outbound calls to the notification-service via Feign.
 * Matches the NotificationRequestDTO schema in notification-service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboundNotificationDTO {
    private Long userId;
    private Long customerId;
    private String channel;          // EMAIL, SMS, PUSH, IN_APP
    private String notificationType; // INVOICE_ISSUED, PAYMENT_RECEIVED, INVOICE_OVERDUE, etc.
    private String subject;
    private String message;
}
