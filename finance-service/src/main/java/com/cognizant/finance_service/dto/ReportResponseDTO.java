package com.cognizant.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class ReportResponseDTO {
    private Long reportId;
    private String name;
    private String type;
    private Map<String, Object> filters;
    private String outputUri;
    private LocalDateTime generatedAt;
    private Long generatedBy;
}
