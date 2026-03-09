package com.xala.gym.service;

import com.xala.gym.entity.ExerciseCategory;
import com.xala.gym.entity.ExerciseLevel;
import com.xala.gym.entity.StandardExercise;

import java.util.List;

public interface AdminExerciseService {
    List<ExerciseCategory> getAllCategories();
    ExerciseCategory createCategory(ExerciseCategory category);
    void deleteCategory(Long categoryId);

    List<StandardExercise> getExercisesByCategory(Long categoryId);
    StandardExercise createExercise(Long categoryId, Long equipmentId, StandardExercise exercise);
    void deleteExercise(Long exerciseId);

    List<ExerciseLevel> getLevelsByExercise(Long exerciseId);
    ExerciseLevel createLevel(Long exerciseId, ExerciseLevel level);
    void deleteLevel(Long levelId);
}
