package com.cognizant.sales_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PricingRequest {
    private Long vehicleId;
    private Long customerId;
}
