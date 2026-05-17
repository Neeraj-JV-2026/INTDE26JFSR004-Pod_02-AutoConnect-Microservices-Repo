package com.cognizant.serviceparts.security;

import com.cognizant.serviceparts.dto.TokenValidationResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public String getCurrentJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() instanceof String) {
            String creds = (String) authentication.getCredentials();
            // Ensure "Bearer " prefix is present for downstream Feign calls
            return creds.startsWith("Bearer ") ? creds : "Bearer " + creds;
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

    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public boolean isServiceAdvisor() {
        return hasRole("SERVICE_ADVISOR");
    }

    public boolean isTechnician() {
        return hasRole("TECHNICIAN");
    }
}
