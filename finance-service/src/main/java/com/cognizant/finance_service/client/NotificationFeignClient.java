package com.cognizant.finance_service.client;

import com.cognizant.finance_service.dto.OutboundNotificationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", contextId = "financeNotificationFeignClient")
public interface NotificationFeignClient {

    @PostMapping("/api/notifications")
    void sendNotification(@RequestHeader("Authorization") String token,
                          @RequestBody OutboundNotificationDTO dto);
}
