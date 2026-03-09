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
public class MemberProgressResponse {
    private Double overallPercentage;
    private Integer totalCompletedExercises;
    private Integer totalExercises;
    private List<RoadmapProgress> roadmaps;
    private List<CategoryProgress> categories;
}
