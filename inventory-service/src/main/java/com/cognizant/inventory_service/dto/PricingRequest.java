package com.cognizant.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingRequest {
    private Long vehicleId;
    private Long customerId;
}
