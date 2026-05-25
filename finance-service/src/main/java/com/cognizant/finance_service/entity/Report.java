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
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportScope scope;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> parametersJson;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metricsJson;

    private Long generatedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;

    private String reportUri;

    public enum ReportScope {
        SALES, SERVICE, PARTS, FINANCE
    }
}
