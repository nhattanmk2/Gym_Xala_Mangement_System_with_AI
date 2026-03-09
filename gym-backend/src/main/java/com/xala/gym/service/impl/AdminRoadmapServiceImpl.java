package com.xala.gym.service.impl;

import com.xala.gym.entity.Package;
import com.xala.gym.entity.SessionExercise;
import com.xala.gym.entity.WorkoutRoadmap;
import com.xala.gym.entity.WorkoutSession;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.repository.SessionExerciseRepository;
import com.xala.gym.repository.WorkoutRoadmapRepository;
import com.xala.gym.repository.WorkoutSessionRepository;
import com.xala.gym.service.AdminRoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRoadmapServiceImpl implements AdminRoadmapService {

    private final WorkoutRoadmapRepository roadmapRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final SessionExerciseRepository sessionExerciseRepository;
    private final PackageRepository packageRepository;

    private void updatePackageMaxSessions(Long packageId) {
        Package pkg = packageRepository.findById(packageId).orElse(null);
        if (pkg != null) {
            int totalSessions = sessionRepository.countByRoadmap_GymPackage_Id(packageId);
            pkg.setMaxSessions(totalSessions);
            packageRepository.save(pkg);
        }
    }

    @Override
    @Transactional
    public WorkoutRoadmap createRoadmap(Long packageId, WorkoutRoadmap roadmap) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        roadmap.setGymPackage(pkg);
        return roadmapRepository.save(roadmap);
    }

    @Override
    public List<WorkoutRoadmap> getRoadmapsByPackage(Long packageId) {
        return roadmapRepository.findByGymPackageIdOrderByOrderIndexAsc(packageId);
    }

    @Override
    @Transactional
    public void deleteRoadmap(Long roadmapId) {
        WorkoutRoadmap roadmap = roadmapRepository.findById(roadmapId).orElseThrow();
        Long packageId = roadmap.getGymPackage().getId();
        roadmapRepository.deleteById(roadmapId);
        updatePackageMaxSessions(packageId);
    }

    @Override
    @Transactional
    public WorkoutSession createSession(Long roadmapId, WorkoutSession session) {
        WorkoutRoadmap roadmap = roadmapRepository.findById(roadmapId).orElseThrow();
        session.setRoadmap(roadmap);
        WorkoutSession saved = sessionRepository.save(session);
        updatePackageMaxSessions(roadmap.getGymPackage().getId());
        return saved;
    }

    @Override
    @Transactional
    public void deleteSession(Long sessionId) {
        WorkoutSession session = sessionRepository.findById(sessionId).orElseThrow();
        Long packageId = session.getRoadmap().getGymPackage().getId();
        sessionRepository.deleteById(sessionId);
        updatePackageMaxSessions(packageId);
    }

    @Override
    @Transactional
    public SessionExercise addExerciseToSession(Long sessionId, SessionExercise exercise) {
        WorkoutSession session = sessionRepository.findById(sessionId).orElseThrow();
        exercise.setSession(session);
        return sessionExerciseRepository.save(exercise);
    }

    @Override
    @Transactional
    public void removeExerciseFromSession(Long exerciseId) {
        sessionExerciseRepository.deleteById(exerciseId);
    }
}
