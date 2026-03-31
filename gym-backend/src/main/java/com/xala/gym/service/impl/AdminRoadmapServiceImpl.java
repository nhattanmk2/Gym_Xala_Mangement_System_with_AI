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
    public WorkoutRoadmap updateRoadmap(Long roadmapId, WorkoutRoadmap roadmap) {
        WorkoutRoadmap existing = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Roadmap not found"));
        existing.setName(roadmap.getName());
        existing.setDescription(roadmap.getDescription());
        if (roadmap.getOrderIndex() != null && roadmap.getOrderIndex() != 0) {
            existing.setOrderIndex(roadmap.getOrderIndex());
        }
        return roadmapRepository.save(existing);
    }

    @Override
    @Transactional
    public void reorderRoadmaps(List<Long> roadmapIds) {
        for (int i = 0; i < roadmapIds.size(); i++) {
            Long id = roadmapIds.get(i);
            int newOrder = i + 1;
            roadmapRepository.findById(id).ifPresent(rm -> {
                rm.setOrderIndex(newOrder);
                roadmapRepository.save(rm);
            });
        }
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
    public WorkoutSession updateSession(Long sessionId, WorkoutSession session) {
        WorkoutSession existing = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        existing.setName(session.getName());
        if (session.getOrderIndex() != null && session.getOrderIndex() != 0) {
            existing.setOrderIndex(session.getOrderIndex());
        }
        return sessionRepository.save(existing);
    }

    @Override
    @Transactional
    public void reorderSessions(List<Long> sessionIds) {
        for (int i = 0; i < sessionIds.size(); i++) {
            Long id = sessionIds.get(i);
            int newOrder = i + 1;
            sessionRepository.findById(id).ifPresent(sess -> {
                sess.setOrderIndex(newOrder);
                sessionRepository.save(sess);
            });
        }
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
