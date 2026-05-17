package com.cognizant.finance_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class AuditPackageRequestDTO {

    @NotNull(message = "Period start is required")
    private LocalDateTime periodStart;

    @NotNull(message = "Period end is required")
    private LocalDateTime periodEnd;

    private Map<String, Object> contentsJson;

    private String packageUri;
}
