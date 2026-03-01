package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExerciseResponse {
    private Long id;
    private String name;
    private String description;
    private Integer sets;
    private Integer reps;
    private Integer orderIndex;
    private Boolean isCompleted; // Used for member view
}
