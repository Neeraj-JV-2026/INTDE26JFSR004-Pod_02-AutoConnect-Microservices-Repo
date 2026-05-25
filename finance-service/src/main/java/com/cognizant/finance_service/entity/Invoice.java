package com.cognizant.finance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    private Long customerId;
    
    private String relatedEntityType; // DEAL, WORK_ORDER
    private Long relatedEntityId;

    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime issuedAt;
    
    private LocalDateTime dueAt;

    private String status; // ISSUED, PARTIAL, PAID, OVERDUE, CANCELLED
}
