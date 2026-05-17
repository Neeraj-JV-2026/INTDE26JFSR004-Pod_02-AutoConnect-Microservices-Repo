package com.cognizant.serviceparts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long woId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "app_id", nullable = false)
    private ServiceAppointment appointment;

    @Column(nullable = false)
    private Long advisorId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(columnDefinition = "JSON")
    private String reportedIssues;

    private Double estimatedHours;

    private Long assignedTechnician;

    @Column(columnDefinition = "JSON")
    private String partsRequired;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = WorkOrderStatus.OPEN;
        }
    }

    public enum WorkOrderStatus {
        OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    }
}