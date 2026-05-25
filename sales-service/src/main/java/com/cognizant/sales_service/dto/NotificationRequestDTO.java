package com.cognizant.sales_service.dto;

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
    private String notificationType; // DEAL_APPROVED, DEAL_FINALIZED, COMMISSION_READY, etc.
    private String subject;
    private String message;
}
