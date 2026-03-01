package com.xala.gym.service;

import com.xala.gym.dto.request.WorkoutPlanRequest;
import com.xala.gym.dto.response.WorkoutPlanResponse;
import java.util.List;

public interface WorkoutPlanService {
    // Admin methods
    WorkoutPlanResponse getWorkoutPlanByPackageId(Long packageId);
    WorkoutPlanResponse saveWorkoutPlan(Long packageId, WorkoutPlanRequest request);

    // Member methods
    WorkoutPlanResponse getMemberActiveRoadmap();
    void toggleExerciseCompletion(Long exerciseId);
}
