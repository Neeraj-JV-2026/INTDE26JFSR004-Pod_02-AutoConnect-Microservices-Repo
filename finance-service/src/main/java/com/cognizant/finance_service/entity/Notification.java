package com.cognizant.finance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(nullable = false)
    private Long userId;

    private Long relatedEntityId;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationCategory category;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    private String status; // PENDING, DELIVERED, READ

    public enum NotificationCategory {
        APPOINTMENT, PARTS, FINANCE, RECALL, SYSTEM
    }

    public enum Severity {
        INFO, WARNING, CRITICAL
    }
}
