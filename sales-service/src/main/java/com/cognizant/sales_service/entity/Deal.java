package com.cognizant.sales_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "deals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dealId;

    private Long quoteId;
    private Long salesPersonId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> financeOffer;

    private Long approvedBy;
    private LocalDateTime approvedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> dealDocumentsUri;

    private String status; // PENDING, APPROVED, REJECTED, FINALIZED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
