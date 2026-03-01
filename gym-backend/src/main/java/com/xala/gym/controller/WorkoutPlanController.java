package com.xala.gym.controller;

import com.xala.gym.dto.request.WorkoutPlanRequest;
import com.xala.gym.dto.response.WorkoutPlanResponse;
import com.xala.gym.service.WorkoutPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    // --- ADMIN ENDPOINTS ---
    
    @GetMapping("/admin/packages/{packageId}/workout-plan")
    public ResponseEntity<WorkoutPlanResponse> getPlanByPackage(@PathVariable Long packageId) {
        return ResponseEntity.ok(workoutPlanService.getWorkoutPlanByPackageId(packageId));
    }

    @PostMapping("/admin/packages/{packageId}/workout-plan")
    public ResponseEntity<WorkoutPlanResponse> savePlan(@PathVariable Long packageId, @RequestBody WorkoutPlanRequest request) {
        return ResponseEntity.ok(workoutPlanService.saveWorkoutPlan(packageId, request));
    }

    // --- MEMBER ENDPOINTS ---

    @GetMapping("/member/workout-roadmap")
    public ResponseEntity<WorkoutPlanResponse> getMyRoadmap() {
        return ResponseEntity.ok(workoutPlanService.getMemberActiveRoadmap());
    }

    @PostMapping("/member/workout-roadmap/exercises/{exerciseId}/toggle")
    public ResponseEntity<Void> toggleExercise(@PathVariable Long exerciseId) {
        workoutPlanService.toggleExerciseCompletion(exerciseId);
        return ResponseEntity.ok().build();
    }
}
