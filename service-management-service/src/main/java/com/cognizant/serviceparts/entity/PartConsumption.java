package com.cognizant.serviceparts.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "part_consumptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartConsumption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long consumptionId;

    @Column(name = "part_id", nullable = false)
    private Long partId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private JobCard jobCard;

    @Column(nullable = false)
    private Integer quantity;

    private Long consumedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime consumedAt;

    @PrePersist
    protected void onCreate() {
        this.consumedAt = LocalDateTime.now();
    }
}