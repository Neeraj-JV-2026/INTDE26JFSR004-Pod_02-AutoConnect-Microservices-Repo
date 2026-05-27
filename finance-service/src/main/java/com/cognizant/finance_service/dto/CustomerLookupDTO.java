package com.cognizant.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal projection of the customer-service CustomerResponseDTO.
 * Only the fields needed to resolve the IAM userId from a CRM customerId.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerLookupDTO {
    private Long customerId;
    private Long userId;   // IAM user ID — used to correctly route notifications
    private String name;
}
