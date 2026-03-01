package com.xala.gym.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanRequest {
    private String name;
    private String description;
    private List<WorkoutExerciseRequest> exercises;
}
