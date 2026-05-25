package com.cognizant.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogRequestDTO {
    private Long userId;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String detailsJson;
}
