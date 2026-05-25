package com.cognizant.sales_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType; // PERCENTAGE, FLAT

    @Column(name = "discount_value", nullable = false)
    private BigDecimal value;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Boolean isActive;

    public enum DiscountType {
        PERCENTAGE, FLAT
    }

    @PrePersist
    protected void onCreate() {
        if (this.isActive == null) this.isActive = true;
    }
}
