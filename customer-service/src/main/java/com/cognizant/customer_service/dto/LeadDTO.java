package com.cognizant.customer_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadDTO {

    private Long leadId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Lead source is required")
    private String source;

    private String interestedModel;

    private String status;

    private Long assignedTo;

    private LocalDateTime createdAt;

    private String notes;
}
