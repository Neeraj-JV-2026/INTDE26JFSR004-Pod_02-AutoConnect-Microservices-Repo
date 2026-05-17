package com.cognizant.customer_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InteractionDTO {

    private Long interactionId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Channel is required")
    @Pattern(regexp = "CALL|EMAIL|SMS|CHAT|IN_PERSON",
             message = "Channel must be CALL, EMAIL, SMS, CHAT, or IN_PERSON")
    private String channel;

    @NotBlank(message = "Message is required")
    private String message;

    private LocalDateTime timestamp;

    private String outcome;
}
