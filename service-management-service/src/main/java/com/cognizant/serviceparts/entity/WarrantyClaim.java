package com.cognizant.serviceparts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "warranty_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;

    @Column(name = "warranty_id", nullable = false)
    private Long warrantyId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id")
    private JobCard jobCard;

    @Column(nullable = false)
    private String claimDescription;

    @Column(precision = 10, scale = 2)
    private BigDecimal claimAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal approvedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;

    private Long approvedBy;

    private LocalDateTime approvedAt;

    private String rejectionReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ClaimStatus.SUBMITTED;
        }
    }

    public enum ClaimStatus {
        SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID
    }
}