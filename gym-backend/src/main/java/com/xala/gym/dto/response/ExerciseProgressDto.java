package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseProgressDto {
    private Long sessionExerciseId;
    private String exerciseName;
    private String categoryName;
    private String levelName;
    private Integer sets;
    private Integer reps;
    private Boolean isCompleted;
    private String completedAt;
}
