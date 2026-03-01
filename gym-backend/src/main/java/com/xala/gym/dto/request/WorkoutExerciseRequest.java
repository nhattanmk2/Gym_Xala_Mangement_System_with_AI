package com.xala.gym.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExerciseRequest {
    private Long id; // null for new items
    private String name;
    private String description;
    private Integer sets;
    private Integer reps;
    private Integer orderIndex;
}
