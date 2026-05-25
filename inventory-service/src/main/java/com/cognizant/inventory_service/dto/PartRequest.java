package com.cognizant.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PartRequest {

    @NotBlank(message = "Part number is required")
    private String partNumber;

    @NotBlank(message = "Description is required")
    private String description;

    private String manufacturer;

    private String unitOfMeasure;

    @NotNull(message = "Cost is required")
    private BigDecimal cost;

    @NotNull(message = "Retail price is required")
    private BigDecimal retailPrice;
}
