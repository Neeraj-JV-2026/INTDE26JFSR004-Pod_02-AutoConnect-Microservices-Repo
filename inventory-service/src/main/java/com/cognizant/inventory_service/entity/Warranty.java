package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "warranties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warranty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long warrantyId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private String warrantyType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private Integer mileageLimit;

    @Column(columnDefinition = "TEXT")
    private String coverageDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WarrantyStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = WarrantyStatus.ACTIVE;
        }
    }

    public enum WarrantyStatus {
        ACTIVE, EXPIRED, VOIDED, CLAIMED
    }
}
