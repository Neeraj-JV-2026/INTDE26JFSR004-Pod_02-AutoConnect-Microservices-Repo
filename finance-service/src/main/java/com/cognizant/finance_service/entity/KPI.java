package com.cognizant.finance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "kpis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long kpiId;

    @Column(nullable = false, unique = true)
    private String name;

    private String definition;

    private BigDecimal targetValue;

    private BigDecimal currentValue;

    private String reportingPeriod; // DAILY, WEEKLY, MONTHLY, QUARTERLY
}
