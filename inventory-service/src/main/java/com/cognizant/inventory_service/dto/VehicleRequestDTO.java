package com.cognizant.inventory_service.dto;

import com.cognizant.inventory_service.entity.Vehicle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleRequestDTO {

    @NotBlank(message = "VIN is required")
    private String vin;

    @NotBlank(message = "Stock number is required")
    private String stockNumber;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    private Integer year;

    private String trim;
    private String color;
    private Integer mileage;
    private Vehicle.Condition conditionType;
    private Long locationId;
    private BigDecimal basePrice;
    private BigDecimal msrp;
}
