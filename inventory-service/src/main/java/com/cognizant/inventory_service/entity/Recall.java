package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recalls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recallId;

    @Column(nullable = false, unique = true)
    private String recallNumber;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String affectedModels;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecallStatus status;

    @Column(columnDefinition = "TEXT")
    private String remedyDescription;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RecallStatus.ACTIVE;
        }
    }

    public enum RecallStatus {
        ACTIVE, COMPLETED, CANCELLED
    }
}
