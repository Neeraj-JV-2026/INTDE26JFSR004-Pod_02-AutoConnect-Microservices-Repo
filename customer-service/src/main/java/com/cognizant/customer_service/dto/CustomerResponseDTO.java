package com.cognizant.customer_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerResponseDTO {
    private Long customerId;
    private Long userId;
    private String name;
    private String contactInfo;
    private Long preferredDealerId;
    private String vehicleOwnershipDetails;
    private String loyaltyTier;
    private String status;
    private LocalDateTime createdAt;
}
