package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Advisor ID is required")
    private Long advisorId;

    private String reportedIssues;

    private Double estimatedHours;

    private String partsRequired;
}