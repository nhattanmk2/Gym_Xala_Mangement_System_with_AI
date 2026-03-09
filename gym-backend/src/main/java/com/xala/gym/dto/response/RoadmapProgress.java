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
public class RoadmapProgress {
    private Long roadmapId;
    private String name;
    private Double percentage;
    private Integer completedExercises;
    private Integer totalExercises;
    private List<SessionProgress> sessionProgresses;
}
