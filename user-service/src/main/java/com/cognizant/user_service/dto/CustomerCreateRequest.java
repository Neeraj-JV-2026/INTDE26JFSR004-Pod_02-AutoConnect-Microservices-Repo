package com.cognizant.user_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerCreateRequest {
    private Long userId;
    private String name;
    private String contactInfo;
    private String loyaltyTier;
    private String status;
}
