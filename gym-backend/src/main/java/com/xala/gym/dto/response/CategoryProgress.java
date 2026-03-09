package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryProgress {
    private String categoryName;
    private Double percentage;
    private Integer completedExercises;
    private Integer totalExercises;
}
