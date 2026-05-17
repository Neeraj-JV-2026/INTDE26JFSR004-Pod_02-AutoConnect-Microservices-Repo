package com.cognizant.customer_service.client;

import com.cognizant.customer_service.dto.TokenValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service")
public interface IamFeignClient {

    @PostMapping("/api/auth/validate")
    TokenValidationResponse validateToken(@RequestHeader("Authorization") String token);
}
