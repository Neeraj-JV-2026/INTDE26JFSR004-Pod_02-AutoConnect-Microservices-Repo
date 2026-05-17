package com.cognizant.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceResponseDTO {
    private Long invoiceId;
    private Long customerId;
    private String relatedEntityType;
    private Long relatedEntityId;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private LocalDateTime issuedAt;
    private LocalDateTime dueAt;
    private String status;
}
