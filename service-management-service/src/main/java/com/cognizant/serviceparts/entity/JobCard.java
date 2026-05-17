package com.cognizant.serviceparts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "wo_id", nullable = false)
    private WorkOrder workOrder;

    @Column(nullable = false)
    private Long technicianId;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @Column(columnDefinition = "JSON")
    private String findings;

    @Column(columnDefinition = "JSON")
    private String actions;

    @Column(columnDefinition = "JSON")
    private String photos;

    private Long signedOffBy;

    private LocalDateTime signedOffAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobCardStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = JobCardStatus.CREATED;
        }
    }

    public enum JobCardStatus {
        CREATED, IN_PROGRESS, COMPLETED, SIGNED_OFF
    }
}