package com.cognizant.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class AuditPackageResponseDTO {

    private Long packageId;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, Object> contentsJson;
    private LocalDateTime generatedAt;
    private String packageUri;
}
