package com.cognizant.serviceparts.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceRequest {

    private Long customerId;
    private String relatedEntityType;
    private Long relatedEntityId;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private LocalDateTime dueAt;

    // Extended fields carried as context (not mapped to finance-service DTO but useful for logging)
    private Long vehicleId;
    private Long workOrderId;
    private Long jobCardId;
    private LocalDateTime serviceDate;
    private String notes;
    private List<InvoiceLineItem> lineItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceLineItem {
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
    }
}
