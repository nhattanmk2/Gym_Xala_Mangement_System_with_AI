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
public class SessionProgress {
    private Long sessionId;
    private String name;
    private Double percentage;
    private Integer completedExercises;
    private Integer totalExercises;
    // Có thể trả về luôn ds bài tập có isCompleted cho UI tiện render
    private List<ExerciseProgressDto> exercises; 
}
