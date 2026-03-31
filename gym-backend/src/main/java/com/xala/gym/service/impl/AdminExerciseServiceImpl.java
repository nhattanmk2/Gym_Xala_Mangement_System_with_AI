package com.xala.gym.service.impl;

import com.xala.gym.entity.ExerciseCategory;
import com.xala.gym.entity.ExerciseLevel;
import com.xala.gym.entity.StandardExercise;
import com.xala.gym.repository.ExerciseCategoryRepository;
import com.xala.gym.repository.ExerciseLevelRepository;
import com.xala.gym.repository.GymEquipmentRepository;
import com.xala.gym.repository.StandardExerciseRepository;
import com.xala.gym.service.AdminExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminExerciseServiceImpl implements AdminExerciseService {

    private final ExerciseCategoryRepository categoryRepository;
    private final StandardExerciseRepository exerciseRepository;
    private final ExerciseLevelRepository levelRepository;
    private final GymEquipmentRepository equipmentRepository;

    @Override
    public List<ExerciseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public ExerciseCategory createCategory(ExerciseCategory category) {
        return categoryRepository.save(category);
    }

    @Override
    public ExerciseCategory updateCategory(Long id, ExerciseCategory category) {
        ExerciseCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return categoryRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        List<StandardExercise> exercises = exerciseRepository.findByCategoryId(categoryId);
        for (StandardExercise ex : exercises) {
            deleteExercise(ex.getId());
        }
        categoryRepository.deleteById(categoryId);
    }

    @Override
    public List<StandardExercise> getExercisesByCategory(Long categoryId) {
        return exerciseRepository.findByCategoryId(categoryId);
    }

    @Override
    @Transactional
    public StandardExercise createExercise(Long categoryId, Long equipmentId, StandardExercise exercise) {
        ExerciseCategory category = categoryRepository.findById(categoryId).orElseThrow();
        exercise.setCategory(category);
        
        if (equipmentId != null) {
            exercise.setEquipment(equipmentRepository.findById(equipmentId).orElse(null));
        }
        
        StandardExercise savedExercise = exerciseRepository.save(exercise);
        
        // Auto-create 3 levels: LOW, MEDIUM, HIGH
        levelRepository.save(ExerciseLevel.builder()
                .standardExercise(savedExercise)
                .levelName("LOW")
                .sets(4)
                .reps(10)
                .build());
        
        levelRepository.save(ExerciseLevel.builder()
                .standardExercise(savedExercise)
                .levelName("MEDIUM")
                .sets(4)
                .reps(12)
                .build());
        
        levelRepository.save(ExerciseLevel.builder()
                .standardExercise(savedExercise)
                .levelName("HIGH")
                .sets(4)
                .reps(15)
                .build());
        
        return savedExercise;
    }

    @Override
    public StandardExercise updateExercise(Long id, StandardExercise exercise) {
        StandardExercise existing = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        existing.setName(exercise.getName());
        existing.setDescription(exercise.getDescription());
        return exerciseRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteExercise(Long exerciseId) {
        List<ExerciseLevel> levels = levelRepository.findByStandardExerciseId(exerciseId);
        levelRepository.deleteAll(levels);
        exerciseRepository.deleteById(exerciseId);
    }

    @Override
    public List<ExerciseLevel> getLevelsByExercise(Long exerciseId) {
        return levelRepository.findByStandardExerciseId(exerciseId);
    }

    @Override
    public ExerciseLevel createLevel(Long exerciseId, ExerciseLevel level) {
        StandardExercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        level.setStandardExercise(exercise);
        return levelRepository.save(level);
    }

    @Override
    public ExerciseLevel updateLevel(Long id, ExerciseLevel level) {
        ExerciseLevel existing = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));
        existing.setSets(level.getSets());
        existing.setReps(level.getReps());
        return levelRepository.save(existing);
    }

    @Override
    public void deleteLevel(Long levelId) {
        levelRepository.deleteById(levelId);
    }
}
