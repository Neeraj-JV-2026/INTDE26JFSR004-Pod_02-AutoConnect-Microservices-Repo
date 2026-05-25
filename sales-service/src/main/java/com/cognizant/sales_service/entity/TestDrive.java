package com.cognizant.sales_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_drives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long vehicleId;

    private Long salesPersonId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private TestDriveStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = TestDriveStatus.REQUESTED;
    }

    public enum TestDriveStatus {
        REQUESTED, SCHEDULED, COMPLETED, CANCELLED
    }
}
