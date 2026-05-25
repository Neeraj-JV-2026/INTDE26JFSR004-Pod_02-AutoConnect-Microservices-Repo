package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "part_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Column(nullable = false)
    private Long locationId;

    @Column(nullable = false)
    private Integer quantityOnHand;

    @Column(nullable = false)
    private Integer quantityReserved;

    private Integer reorderPoint;

    private LocalDateTime lastUpdatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastUpdatedAt = LocalDateTime.now();
    }
}
