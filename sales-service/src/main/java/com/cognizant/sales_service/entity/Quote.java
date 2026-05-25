package com.cognizant.sales_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "quotes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quoteId;

    private Long customerId;
    private Long vehicleId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> tradeInDetails;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> options;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> taxes;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> fees;

    private BigDecimal totalPrice;
    
    private LocalDateTime expiresAt;
    
    private Long createdBy; // User ID

    private String status; // DRAFT, GENERATED, EXPIRED, ACCEPTED, REJECTED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
