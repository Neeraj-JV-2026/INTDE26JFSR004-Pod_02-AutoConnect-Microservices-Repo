package com.cognizant.customer_service.service;

import com.cognizant.customer_service.dto.AuditLogRequestDTO;
import com.cognizant.customer_service.dto.TokenValidationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final RestTemplate restTemplate;

    @Value("${app.user-service.url}")
    private String userServiceUrl;

    public void logAction(String action, String resourceType, Long resourceId, String details) {
        try {
            String auditUrl = userServiceUrl.replace("/validate", "/audit-logs");
            
            Long currentUserId = 0L;
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof TokenValidationResponse) {
                currentUserId = ((TokenValidationResponse) principal).getUserId();
            }

            AuditLogRequestDTO request = AuditLogRequestDTO.builder()
                    .userId(currentUserId)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .detailsJson(details)
                    .build();

            restTemplate.postForObject(auditUrl, request, Object.class);
        } catch (Exception e) {
            System.err.println("Failed to send remote audit log: " + e.getMessage());
        }
    }
}
