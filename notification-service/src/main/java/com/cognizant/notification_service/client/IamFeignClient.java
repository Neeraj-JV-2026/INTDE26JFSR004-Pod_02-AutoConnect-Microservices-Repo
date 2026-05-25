package com.cognizant.notification_service.client;

import com.cognizant.notification_service.dto.TokenValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign client for delegating JWT validation to the IAM (user-service).
 * Each incoming request is validated before reaching any endpoint.
 */
@FeignClient(
    name = "iam-service",
    url = "${app.user-service.url:http://localhost:8082}",
    contextId = "iamFeignClientNotification"
)
public interface IamFeignClient {

    @PostMapping("/api/auth/validate")
    TokenValidationResponse validateToken(@RequestHeader("Authorization") String token);
}
