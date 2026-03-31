package com.xala.gym.controller;

import com.xala.gym.entity.ExerciseCategory;
import com.xala.gym.entity.ExerciseLevel;
import com.xala.gym.entity.StandardExercise;
import com.xala.gym.service.AdminExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/exercises")
@RequiredArgsConstructor
public class AdminExerciseController {

    private final AdminExerciseService exerciseService;

    @GetMapping("/categories")
    public ResponseEntity<List<ExerciseCategory>> getCategories() {
        return ResponseEntity.ok(exerciseService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<ExerciseCategory> createCategory(@RequestBody ExerciseCategory category) {
        return ResponseEntity.ok(exerciseService.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ExerciseCategory> updateCategory(@PathVariable Long id, @RequestBody ExerciseCategory category) {
        return ResponseEntity.ok(exerciseService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        exerciseService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/categories/{categoryId}/standards")
    public ResponseEntity<List<StandardExercise>> getExercises(@PathVariable Long categoryId) {
        return ResponseEntity.ok(exerciseService.getExercisesByCategory(categoryId));
    }

    @PostMapping("/categories/{categoryId}/standards")
    public ResponseEntity<StandardExercise> createExercise(
            @PathVariable Long categoryId, 
            @RequestParam(required = false) Long equipmentId,
            @RequestBody StandardExercise exercise) {
        return ResponseEntity.ok(exerciseService.createExercise(categoryId, equipmentId, exercise));
    }

    @PutMapping("/standards/{id}")
    public ResponseEntity<StandardExercise> updateExercise(@PathVariable Long id, @RequestBody StandardExercise exercise) {
        return ResponseEntity.ok(exerciseService.updateExercise(id, exercise));
    }

    @DeleteMapping("/standards/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/standards/{exerciseId}/levels")
    public ResponseEntity<List<ExerciseLevel>> getLevels(@PathVariable Long exerciseId) {
        return ResponseEntity.ok(exerciseService.getLevelsByExercise(exerciseId));
    }

    @PostMapping("/standards/{exerciseId}/levels")
    public ResponseEntity<ExerciseLevel> createLevel(@PathVariable Long exerciseId, @RequestBody ExerciseLevel level) {
        return ResponseEntity.ok(exerciseService.createLevel(exerciseId, level));
    }

    @PutMapping("/levels/{id}")
    public ResponseEntity<ExerciseLevel> updateLevel(@PathVariable Long id, @RequestBody ExerciseLevel level) {
        return ResponseEntity.ok(exerciseService.updateLevel(id, level));
    }

    @DeleteMapping("/levels/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        exerciseService.deleteLevel(id);
        return ResponseEntity.ok().build();
    }
}
