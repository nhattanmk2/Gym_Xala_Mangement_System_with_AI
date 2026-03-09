package com.xala.gym.service;

import com.xala.gym.entity.SessionExercise;
import com.xala.gym.entity.WorkoutRoadmap;
import com.xala.gym.entity.WorkoutSession;

import java.util.List;

public interface AdminRoadmapService {
    WorkoutRoadmap createRoadmap(Long packageId, WorkoutRoadmap roadmap);
    List<WorkoutRoadmap> getRoadmapsByPackage(Long packageId);
    void deleteRoadmap(Long roadmapId);

    WorkoutSession createSession(Long roadmapId, WorkoutSession session);
    void deleteSession(Long sessionId);

    SessionExercise addExerciseToSession(Long sessionId, SessionExercise exercise);
    void removeExerciseFromSession(Long exerciseId);
}
