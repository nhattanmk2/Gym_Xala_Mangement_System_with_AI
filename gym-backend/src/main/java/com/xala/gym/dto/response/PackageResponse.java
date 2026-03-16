package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer durationInDays;
    private Integer maxSessions;
    private String category;
    private byte[] image;
    private String promotion;
    private java.util.List<AdminPtResponse> personalTrainers;
}
