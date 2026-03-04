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
public class RecommendedPackageDto {
    private PackageResponse packageInfo;
    private String reason;
    private List<PtMatchingResponse> recommendedPts;
}
