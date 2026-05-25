package com.cognizant.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponseDTO {
    private Long paymentId;
    private Long invoiceId;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionReference;
    private LocalDateTime paidAt;
    private String status;
}
