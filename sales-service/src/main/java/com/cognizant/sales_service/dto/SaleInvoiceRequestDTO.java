package com.cognizant.sales_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleInvoiceRequestDTO {

    private Long customerId;
    private String relatedEntityType;
    private Long relatedEntityId;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private LocalDateTime dueAt;
}
