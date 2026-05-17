package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long promoId;

    @NotBlank(message = "Promotion code is required")
    @Column(unique = true, nullable = false)
    private String code;

    private String name;
    private String type; // PERCENTAGE, FIXED_AMOUNT

    // Example: {"minPrice": 500000} or {"make": "Honda"}
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> conditions;

    // Example: {"type": "PERCENTAGE", "discount": 2}
    // or       {"type": "FIXED", "discount": 20000}
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> actions;

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Integer usageLimit;

    private String status; // ACTIVE, EXPIRED, DISABLED
}
