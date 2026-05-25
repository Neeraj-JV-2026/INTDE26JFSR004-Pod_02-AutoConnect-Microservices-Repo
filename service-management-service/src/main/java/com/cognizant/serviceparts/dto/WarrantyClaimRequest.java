package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyClaimRequest {

    @NotNull(message = "Warranty ID is required")
    private Long warrantyId;

    private Long jobCardId;

    @NotBlank(message = "Claim description is required")
    private String claimDescription;

    @NotNull(message = "Claim amount is required")
    private BigDecimal claimAmount;
}