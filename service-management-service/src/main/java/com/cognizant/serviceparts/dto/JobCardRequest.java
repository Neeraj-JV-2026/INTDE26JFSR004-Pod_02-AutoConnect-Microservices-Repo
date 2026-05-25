package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardRequest {

    @NotNull(message = "Work Order ID is required")
    private Long workOrderId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private String findings;

    private String actions;

    private String photos;
}