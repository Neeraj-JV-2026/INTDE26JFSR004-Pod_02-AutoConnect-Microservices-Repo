package com.cognizant.serviceparts.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PartDTO {
    private Long partId;
    private String partNumber;
    private String description;
    private String manufacturer;
    private String unitOfMeasure;
    private BigDecimal cost;
    private BigDecimal retailPrice;
    private String status;
}
