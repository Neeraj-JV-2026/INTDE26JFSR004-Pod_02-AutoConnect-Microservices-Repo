package com.cognizant.sales_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "commissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commissionId;

    private Long dealId;
    private Long salesPersonId;

    private BigDecimal commissionAmount;

    private LocalDateTime calculatedAt;
    private LocalDateTime paidAt;

    private String status; // CALCULATED, PENDING, PAID
}
