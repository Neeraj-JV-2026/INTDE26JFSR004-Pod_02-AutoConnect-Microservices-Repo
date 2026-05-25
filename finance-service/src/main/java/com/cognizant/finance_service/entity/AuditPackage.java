package com.cognizant.finance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "audit_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long packageId;

    @Column(nullable = false)
    private LocalDateTime periodStart;

    @Column(nullable = false)
    private LocalDateTime periodEnd;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> contentsJson;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;

    private String packageUri;
}
