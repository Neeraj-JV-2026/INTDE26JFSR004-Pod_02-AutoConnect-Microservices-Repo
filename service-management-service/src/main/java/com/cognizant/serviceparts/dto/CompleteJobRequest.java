package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteJobRequest {

    @NotNull(message = "Sign-off user ID is required")
    private Long signedOffBy;

    private String findings;

    private String actions;

    private String photos;
}