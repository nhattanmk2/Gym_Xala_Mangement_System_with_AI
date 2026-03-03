package com.xala.gym.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MemberExerciseProgressResponse {
    private Long id;
    private String exerciseName;
    private String description;
    private Integer sets;
    private Integer reps;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
}
