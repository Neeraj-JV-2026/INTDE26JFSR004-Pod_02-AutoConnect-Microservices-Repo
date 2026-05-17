package com.cognizant.finance_service.client;

import com.cognizant.finance_service.dto.TokenValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "iam-service", url = "${app.user-service.url:http://localhost:8082}", contextId = "iamFeignClient")
public interface IamFeignClient {
    @PostMapping("/api/auth/validate")
    TokenValidationResponse validateToken(@RequestHeader("Authorization") String token);
}
