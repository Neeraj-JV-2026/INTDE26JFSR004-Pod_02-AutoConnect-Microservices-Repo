package com.cognizant.finance_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InvoiceRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private String relatedEntityType;
    private Long relatedEntityId;

    @NotNull(message = "Sub total is required")
    @PositiveOrZero(message = "Sub total must be zero or positive")
    private BigDecimal subTotal;

    @NotNull(message = "Tax amount is required")
    @PositiveOrZero(message = "Tax amount must be zero or positive")
    private BigDecimal taxAmount;

    private LocalDateTime dueAt;
}
