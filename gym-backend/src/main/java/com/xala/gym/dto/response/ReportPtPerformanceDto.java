package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportPtPerformanceDto {
    private Long ptId;
    private String ptName;
    private Integer completedSessions;
    private Double averageRating;
    private String branchName;
    private String specialty;
}
