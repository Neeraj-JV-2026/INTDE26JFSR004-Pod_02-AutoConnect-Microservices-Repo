package com.cognizant.finance_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReconciliationRequestDTO {

    @NotNull(message = "Period start is required")
    private LocalDateTime periodStart;

    @NotNull(message = "Period end is required")
    private LocalDateTime periodEnd;

    private String notes;
}
