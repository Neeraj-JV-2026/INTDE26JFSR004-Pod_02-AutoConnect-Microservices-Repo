package com.cognizant.sales_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "customer-service")
public interface CrmFeignClient {
    
    @GetMapping("/api/customers/{id}")
    Object getCustomer(@RequestHeader("Authorization") String token, @PathVariable("id") Long id);
}
