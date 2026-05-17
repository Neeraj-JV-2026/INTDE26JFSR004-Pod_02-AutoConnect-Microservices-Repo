package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTechnicianRequest {

    @NotNull(message = "Technician ID is required")
    private Long technicianId;
}