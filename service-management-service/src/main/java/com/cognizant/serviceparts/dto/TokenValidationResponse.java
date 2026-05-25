package com.cognizant.serviceparts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenValidationResponse {

    private boolean valid;
    private Long userId;
    private String email;
    private String role;
    private String message;
}
