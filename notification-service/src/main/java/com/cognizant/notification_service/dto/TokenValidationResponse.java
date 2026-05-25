package com.cognizant.notification_service.dto;

import lombok.Data;

/**
 * Response returned by the IAM service's /api/auth/validate endpoint.
 * Mirrored across all microservices.
 */
@Data
public class TokenValidationResponse {
    private boolean valid;
    private String email;
    private String role;
    private Long userId;
}
