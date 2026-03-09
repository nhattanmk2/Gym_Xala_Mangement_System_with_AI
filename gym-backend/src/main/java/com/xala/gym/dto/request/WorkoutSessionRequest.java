package com.xala.gym.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class WorkoutSessionRequest {
    private String name;
    private Integer orderIndex;
    private List<SessionExerciseRequest> exercises;
}
