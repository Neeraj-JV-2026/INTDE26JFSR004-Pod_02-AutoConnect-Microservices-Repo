package com.cognizant.inventory_service.dto;

import com.cognizant.inventory_service.entity.Vehicle;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class VehicleResponseDTO {
    private Long vehicleId;
    private String vin;
    private String stockNumber;
    private String make;
    private String model;
    private Integer year;
    private String trim;
    private String color;
    private Integer mileage;
    private Vehicle.Condition conditionType;
    private Long locationId;
    private Vehicle.VehicleStatus status;
    private BigDecimal basePrice;
    private BigDecimal msrp;
    private LocalDateTime createdAt;
}
