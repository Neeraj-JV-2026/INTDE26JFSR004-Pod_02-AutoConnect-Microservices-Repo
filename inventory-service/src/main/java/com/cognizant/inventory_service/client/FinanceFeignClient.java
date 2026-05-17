package com.cognizant.inventory_service.client;

import com.cognizant.inventory_service.dto.NotificationRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "finance-service")
public interface FinanceFeignClient {

    @PostMapping("/api/finance/notifications")
    void sendNotification(@RequestHeader(value = "Authorization", required = false) String token,
                          @RequestBody NotificationRequestDTO dto);
}
