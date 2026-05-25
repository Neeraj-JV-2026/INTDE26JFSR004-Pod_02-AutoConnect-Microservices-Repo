package com.cognizant.serviceparts.client;

import com.cognizant.serviceparts.dto.NotificationRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", contextId = "serviceNotificationFeignClient")
public interface NotificationFeignClient {

    @PostMapping("/api/notifications")
    void sendNotification(@RequestHeader("Authorization") String token,
                          @RequestBody NotificationRequestDTO dto);
}
