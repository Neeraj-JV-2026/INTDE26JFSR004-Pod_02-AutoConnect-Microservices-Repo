package com.cognizant.finance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Long invoiceId;
    private BigDecimal amount;
    
    private String paymentMethod; // CREDIT_CARD, BANK_TRANSFER, CASH, FINANCING
    private String transactionReference;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime paidAt;

    private String status; // SUCCESS, PENDING, FAILED
}
