package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConsultationResponse {
    private double bmi;
    private String bmiCategory;
    private String advice;
    private List<RecommendedPackageDto> recommendedPackages;
}
