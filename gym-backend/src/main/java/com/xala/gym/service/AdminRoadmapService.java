package com.xala.gym.service;

import com.xala.gym.entity.SessionExercise;
import com.xala.gym.entity.WorkoutRoadmap;
import com.xala.gym.entity.WorkoutSession;

import java.util.List;

public interface AdminRoadmapService {
    WorkoutRoadmap createRoadmap(Long packageId, WorkoutRoadmap roadmap);
    List<WorkoutRoadmap> getRoadmapsByPackage(Long packageId);
    WorkoutRoadmap updateRoadmap(Long roadmapId, WorkoutRoadmap roadmap);
    void reorderRoadmaps(List<Long> roadmapIds);
    void deleteRoadmap(Long roadmapId);

    WorkoutSession createSession(Long roadmapId, WorkoutSession session);
    WorkoutSession updateSession(Long sessionId, WorkoutSession session);
    void reorderSessions(List<Long> sessionIds);
    void deleteSession(Long sessionId);

    SessionExercise addExerciseToSession(Long sessionId, SessionExercise exercise);
    void removeExerciseFromSession(Long exerciseId);
}
