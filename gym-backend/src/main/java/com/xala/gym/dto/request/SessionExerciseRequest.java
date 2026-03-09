package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class SessionExerciseRequest {
    private Long exerciseLevelId;
    private Integer orderIndex;
}
