package com.cognizant.sales_service.client;

import com.cognizant.sales_service.dto.NotificationRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", contextId = "salesNotificationFeignClient")
public interface NotificationFeignClient {

    @PostMapping("/api/notifications/internal")
    void sendNotification(@RequestHeader("Authorization") String token,
                          @RequestBody NotificationRequestDTO dto);
}
