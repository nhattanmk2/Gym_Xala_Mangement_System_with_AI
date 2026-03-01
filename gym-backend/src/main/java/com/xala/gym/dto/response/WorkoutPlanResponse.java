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
public class WorkoutPlanResponse {
    private Long id;
    private Long packageId;
    private String name;
    private String description;
    private List<WorkoutExerciseResponse> exercises;
}
