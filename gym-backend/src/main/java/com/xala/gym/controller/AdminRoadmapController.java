package com.xala.gym.controller;

import com.xala.gym.dto.ReorderRequest;
import com.xala.gym.entity.SessionExercise;
import com.xala.gym.entity.WorkoutRoadmap;
import com.xala.gym.entity.WorkoutSession;
import com.xala.gym.service.AdminRoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roadmaps")
@RequiredArgsConstructor
public class AdminRoadmapController {

    private final AdminRoadmapService adminRoadmapService;

    @GetMapping("/package/{packageId}")
    public ResponseEntity<List<WorkoutRoadmap>> getRoadmaps(@PathVariable Long packageId) {
        return ResponseEntity.ok(adminRoadmapService.getRoadmapsByPackage(packageId));
    }

    @PostMapping("/package/{packageId}")
    public ResponseEntity<WorkoutRoadmap> createRoadmap(@PathVariable Long packageId, @RequestBody WorkoutRoadmap roadmap) {
        return ResponseEntity.ok(adminRoadmapService.createRoadmap(packageId, roadmap));
    }

    @PutMapping("/{roadmapId}")
    public ResponseEntity<WorkoutRoadmap> updateRoadmap(@PathVariable Long roadmapId, @RequestBody WorkoutRoadmap roadmap) {
        return ResponseEntity.ok(adminRoadmapService.updateRoadmap(roadmapId, roadmap));
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderRoadmaps(@RequestBody ReorderRequest request) {
        if (request.getIds() != null) {
            adminRoadmapService.reorderRoadmaps(request.getIds());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roadmapId}")
    public ResponseEntity<Void> deleteRoadmap(@PathVariable Long roadmapId) {
        adminRoadmapService.deleteRoadmap(roadmapId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roadmapId}/sessions")
    public ResponseEntity<WorkoutSession> createSession(@PathVariable Long roadmapId, @RequestBody WorkoutSession session) {
        return ResponseEntity.ok(adminRoadmapService.createSession(roadmapId, session));
    }

    @PutMapping("/sessions/{sessionId}")
    public ResponseEntity<WorkoutSession> updateSession(@PathVariable Long sessionId, @RequestBody WorkoutSession session) {
        return ResponseEntity.ok(adminRoadmapService.updateSession(sessionId, session));
    }

    @PostMapping("/sessions/reorder")
    public ResponseEntity<Void> reorderSessions(@RequestBody ReorderRequest request) {
        if (request.getIds() != null) {
            adminRoadmapService.reorderSessions(request.getIds());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        adminRoadmapService.deleteSession(sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sessions/{sessionId}/exercises")
    public ResponseEntity<SessionExercise> addExercise(@PathVariable Long sessionId, @RequestBody SessionExercise exercise) {
        return ResponseEntity.ok(adminRoadmapService.addExerciseToSession(sessionId, exercise));
    }

    @DeleteMapping("/exercises/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long exerciseId) {
        adminRoadmapService.removeExerciseFromSession(exerciseId);
        return ResponseEntity.ok().build();
    }
}
