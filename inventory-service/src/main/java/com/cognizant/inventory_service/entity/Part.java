package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "parts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long partId;

    @Column(nullable = false, unique = true)
    private String partNumber;

    @Column(nullable = false)
    private String description;

    private String manufacturer;

    private String unitOfMeasure;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(precision = 10, scale = 2)
    private BigDecimal retailPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartStatus status;

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = PartStatus.ACTIVE;
        }
    }

    public enum PartStatus {
        ACTIVE, INACTIVE, DISCONTINUED
    }
}
