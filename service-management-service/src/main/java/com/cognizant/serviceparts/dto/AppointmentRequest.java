package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Advisor ID is required")
    private Long advisorId;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Duration is required")
    private Integer durationMinutes;

    @NotNull(message = "Service type is required")
    private String serviceType;
}