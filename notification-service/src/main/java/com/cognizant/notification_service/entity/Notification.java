package com.cognizant.notification_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Persistent notification record.
 *
 * One row is created for every notification event dispatched by
 * any microservice (deal finalized, invoice overdue, appointment
 * reminder, recall alert, etc.)
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    /** Recipient user ID (from user-service) */
    @Column(nullable = false)
    private Long userId;

    /** Optional CRM customer ID (null for staff-only notifications) */
    private Long customerId;

    /**
     * Notification channel: EMAIL, SMS, PUSH, IN_APP
     */
    @Column(nullable = false, length = 20)
    private String channel;

    /**
     * Business event type: DEAL_FINALIZED, INVOICE_OVERDUE, APPOINTMENT_REMINDER,
     * RECALL_ALERT, PAYMENT_RECEIVED, COMMISSION_READY, SERVICE_COMPLETE, etc.
     */
    @Column(nullable = false, length = 50)
    private String notificationType;

    /** Email subject or push title */
    @Column(length = 255)
    private String subject;

    /** Full notification body */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    /**
     * Delivery status: PENDING, SENT, FAILED, READ
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    /** When the notification was created */
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** When the notification was actually dispatched */
    private LocalDateTime sentAt;

    /** When the recipient read / acknowledged the notification */
    private LocalDateTime readAt;

    /**
     * Optional JSON metadata (e.g. invoiceId, dealId for deep-link routing).
     * Stored as plain VARCHAR for simplicity; parse in the application layer.
     */
    @Column(length = 1000)
    private String metadata;

    /** Number of delivery attempts (for retry logic) */
    @Builder.Default
    private Integer retryCount = 0;
}
