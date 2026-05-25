package com.cognizant.user_service.client;

import com.cognizant.user_service.dto.CustomerCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "customer-service", path = "/api/customers")
public interface CustomerFeignClient {

    @PostMapping("/self-register")
    Object selfRegister(@RequestHeader("Authorization") String token,
                        @RequestBody CustomerCreateRequest request);
}
