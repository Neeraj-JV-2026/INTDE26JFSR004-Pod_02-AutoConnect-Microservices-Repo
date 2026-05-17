package com.cognizant.serviceparts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private Long advisorId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private String serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = AppointmentStatus.BOOKED;
        }
    }

    public enum AppointmentStatus {
        BOOKED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}