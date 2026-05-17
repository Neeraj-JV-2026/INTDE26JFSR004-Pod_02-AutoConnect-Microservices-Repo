package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartInventoryRequest {

    @NotNull(message = "Part ID is required")
    private Long partId;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Quantity on hand is required")
    private Integer quantityOnHand;

    @NotNull(message = "Quantity reserved is required")
    private Integer quantityReserved;

    private Integer reorderPoint;
}