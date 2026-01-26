package com.xala.gym.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PackageRequest {
    private String name;
    private String description;
    private Double price;
    private Integer durationInDays;
    private String category;
    private Boolean active;
}