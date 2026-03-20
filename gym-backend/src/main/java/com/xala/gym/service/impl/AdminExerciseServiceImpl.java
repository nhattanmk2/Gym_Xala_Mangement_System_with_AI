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
    public StandardExercise createExercise(Long categoryId, Long equipmentId, StandardExercise exercise) {
        ExerciseCategory category = categoryRepository.findById(categoryId).orElseThrow();
        exercise.setCategory(category);
        
        if (equipmentId != null) {
            exercise.setEquipment(equipmentRepository.findById(equipmentId).orElse(null));
        }
        
        return exerciseRepository.save(exercise);
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
    public void deleteLevel(Long levelId) {
        levelRepository.deleteById(levelId);
    }
}
