package com.cognizant.serviceparts.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.Map;

@FeignClient(name = "crm-service")
public interface CrmFeignClient {

    @GetMapping("/api/customers/{id}")
    Map<String, Object> getCustomerById(
            @PathVariable("id") Long customerId,
            @RequestHeader("Authorization") String token);
}