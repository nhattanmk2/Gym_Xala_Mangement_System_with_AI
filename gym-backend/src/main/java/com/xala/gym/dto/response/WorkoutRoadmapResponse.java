package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutRoadmapResponse {
    private Long id;
    private String name;
    private String description;
    private Integer orderIndex;
    private Integer sessionCount;
}
