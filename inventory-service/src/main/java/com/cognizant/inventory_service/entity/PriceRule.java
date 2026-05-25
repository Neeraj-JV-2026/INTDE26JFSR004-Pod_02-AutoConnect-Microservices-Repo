package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "price_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long priceRuleId;

    private String name;

    // Example: {"make": "Toyota", "year": 2024}
    // If empty, the rule applies to all vehicles
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> conditions;

    // Example: {"type": "FIXED", "amount": 50000}
    // or       {"type": "PERCENTAGE", "percentage": 5}
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> adjustmentExpression;

    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;

    private Integer priority;

    private String status; // ACTIVE, INACTIVE
}
