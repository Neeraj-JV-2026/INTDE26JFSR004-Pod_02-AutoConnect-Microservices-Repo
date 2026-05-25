package com.cognizant.serviceparts.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteJobRequest {

    // Optional — the backend always overrides this from the authenticated JWT principal
    private Long signedOffBy;

    private String findings;

    private String actions;

    private String photos;
}