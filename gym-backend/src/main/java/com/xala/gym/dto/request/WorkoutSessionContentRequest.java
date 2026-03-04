package com.xala.gym.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSessionContentRequest {
    private String exercises;
    private String achievedGoals;
    private String ptEvaluation;
}
