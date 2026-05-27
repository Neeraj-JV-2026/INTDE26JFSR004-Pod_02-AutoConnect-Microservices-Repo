package com.cognizant.serviceparts.client;

import com.cognizant.serviceparts.dto.NotificationRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", contextId = "serviceNotificationFeignClient")
public interface NotificationFeignClient {

    /**
     * Use the /internal endpoint so that any valid JWT is accepted regardless of role.
     * The regular POST /api/notifications requires a staff role, which fails when the
     * originating user is a CUSTOMER (e.g. booking their own service appointment).
     */
    @PostMapping("/api/notifications/internal")
    void sendNotification(@RequestHeader("Authorization") String token,
                          @RequestBody NotificationRequestDTO dto);
}
