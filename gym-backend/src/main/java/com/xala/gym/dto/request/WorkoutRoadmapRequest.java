package com.xala.gym.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class WorkoutRoadmapRequest {
    private String name;
    private String description;
    private Integer orderIndex;
    private List<WorkoutSessionRequest> sessions;
}
