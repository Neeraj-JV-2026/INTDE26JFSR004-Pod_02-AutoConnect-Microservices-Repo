package com.cognizant.sales_service.security;

import com.cognizant.sales_service.dto.TokenValidationResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public static String getCurrentToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() instanceof String) {
            String creds = (String) authentication.getCredentials();
            // Ensure the token always has the "Bearer " prefix for downstream Feign calls
            return creds.startsWith("Bearer ") ? creds : "Bearer " + creds;
        }
        return null;
    }

    public static TokenValidationResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getDetails() instanceof TokenValidationResponse) {
            return (TokenValidationResponse) authentication.getDetails();
        }
        return null;
    }

    public static Long getCurrentUserId() {
        TokenValidationResponse user = getCurrentUser();
        return user != null ? user.getUserId() : null;
    }
}
