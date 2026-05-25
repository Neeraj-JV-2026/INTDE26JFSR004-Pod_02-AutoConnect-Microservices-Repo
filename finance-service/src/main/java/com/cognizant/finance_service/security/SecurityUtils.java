package com.cognizant.finance_service.security;

import com.cognizant.finance_service.dto.TokenValidationResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public String getCurrentJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() instanceof String) {
            return (String) authentication.getCredentials();
        }
        return null;
    }

    public TokenValidationResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getDetails() instanceof TokenValidationResponse) {
            return (TokenValidationResponse) authentication.getDetails();
        }
        return null;
    }

    public Long getCurrentUserId() {
        TokenValidationResponse user = getCurrentUser();
        return user != null ? user.getUserId() : null;
    }

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getName();
        }
        return "system";
    }
}
