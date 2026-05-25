package com.cognizant.finance_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class ReportRequestDTO {

    @NotBlank(message = "Report name is required")
    private String name;

    @NotBlank(message = "Report type is required")
    private String type;

    private Map<String, Object> filters;

    private Long generatedBy;
}
