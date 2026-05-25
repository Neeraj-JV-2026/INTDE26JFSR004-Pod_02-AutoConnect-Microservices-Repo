package com.cognizant.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingResponse {
    private BigDecimal basePrice;
    private BigDecimal adjustments;
    private BigDecimal discounts;
    private BigDecimal finalPrice;
}
