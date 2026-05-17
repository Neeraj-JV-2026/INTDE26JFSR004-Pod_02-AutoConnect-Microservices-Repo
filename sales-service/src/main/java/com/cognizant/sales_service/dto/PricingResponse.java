package com.cognizant.sales_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PricingResponse {
    private BigDecimal basePrice;
    private BigDecimal adjustments;
    private BigDecimal discounts;
    private BigDecimal finalPrice;
}
