package com.cognizant.customer_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerRequestDTO {

    @NotBlank(message = "Customer name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Contact info is required")
    private String contactInfo;

    private Long preferredDealerId;

    private String vehicleOwnershipDetails;

    @Pattern(regexp = "BRONZE|SILVER|GOLD|PLATINUM",
             message = "Loyalty tier must be BRONZE, SILVER, GOLD, or PLATINUM")
    private String loyaltyTier;

    @Pattern(regexp = "ACTIVE|INACTIVE|BLOCKED",
             message = "Status must be ACTIVE, INACTIVE, or BLOCKED")
    private String status;

    /** Optional: IAM userId — set automatically during CUSTOMER self-registration */
    private Long userId;
}
