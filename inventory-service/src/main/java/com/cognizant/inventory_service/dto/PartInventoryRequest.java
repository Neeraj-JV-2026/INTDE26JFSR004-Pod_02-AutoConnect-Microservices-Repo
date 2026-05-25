package com.cognizant.inventory_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PartInventoryRequest {

    @NotNull(message = "Part ID is required")
    private Long partId;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity on hand cannot be negative")
    private Integer quantityOnHand;

    @NotNull(message = "Quantity reserved is required")
    @Min(value = 0, message = "Quantity reserved cannot be negative")
    private Integer quantityReserved;

    private Integer reorderPoint;
}
