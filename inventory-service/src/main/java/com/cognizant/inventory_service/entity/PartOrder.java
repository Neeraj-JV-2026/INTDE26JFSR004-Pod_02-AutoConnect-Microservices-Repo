package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "part_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Column(nullable = false)
    private Integer quantityOrdered;

    private Integer quantityReceived;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(nullable = false)
    private Long orderedBy;

    private Long supplierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartOrderStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime orderedAt;

    private LocalDateTime receivedAt;

    @PrePersist
    protected void onCreate() {
        this.orderedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PartOrderStatus.PENDING;
        }
    }

    public enum PartOrderStatus {
        PENDING, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED
    }
}
