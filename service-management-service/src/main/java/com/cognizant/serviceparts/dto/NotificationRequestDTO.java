package com.cognizant.serviceparts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {
    private Long userId;
    private Long customerId;
    private String channel;          // EMAIL, SMS, PUSH, IN_APP
    private String notificationType; // APPOINTMENT_BOOKED, TASK_ASSIGNED, SERVICE_COMPLETE, etc.
    private String subject;
    private String message;
}
