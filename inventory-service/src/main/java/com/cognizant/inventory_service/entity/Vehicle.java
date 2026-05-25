package com.cognizant.inventory_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "VIN is required")
    private String vin;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "Stock number is required")
    private String stockNumber;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Column(name = "vehicle_year")
    private Integer year;

    private String trim;
    private String color;
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50)")
    private Condition conditionType;

    private Long locationId;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50)")
    private VehicleStatus status;

    private BigDecimal basePrice;
    private BigDecimal msrp;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum Condition {
        NEW, USED
    }

    public enum VehicleStatus {
        AVAILABLE, RESERVED, SOLD
    }
}
