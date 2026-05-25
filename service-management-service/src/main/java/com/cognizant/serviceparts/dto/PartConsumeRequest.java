package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartConsumeRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Job Card ID is required")
    private Long jobCardId;

    @NotNull(message = "Location ID is required")
    private Long locationId;
}