package com.cognizant.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ReconciliationResponseDTO {

    private Long auditPackageId;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private long totalInvoices;
    private BigDecimal totalPaymentsCollected;
    private long unpaidInvoiceCount;
    private String reconciledBy;
    private LocalDateTime reconciledAt;
    private String status;
    private String notes;
}
