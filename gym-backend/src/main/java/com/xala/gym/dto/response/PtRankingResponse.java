package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PtRankingResponse {
    private Long ptId;
    private String ptName;
    private int completedSessions;
    private double rating;
}
