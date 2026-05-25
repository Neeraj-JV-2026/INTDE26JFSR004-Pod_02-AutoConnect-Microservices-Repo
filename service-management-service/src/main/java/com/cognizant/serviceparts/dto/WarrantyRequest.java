package com.cognizant.serviceparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRequest {

    @NotNull private Long vehicleId;
    @NotNull private Long customerId;
    @NotNull private String warrantyType;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private Integer mileageLimit;
    private String coverageDetails;
}