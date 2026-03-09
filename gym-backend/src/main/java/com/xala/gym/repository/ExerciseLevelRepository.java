package com.xala.gym.repository;

import com.xala.gym.entity.ExerciseLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseLevelRepository extends JpaRepository<ExerciseLevel, Long> {
    List<ExerciseLevel> findByStandardExerciseId(Long exerciseId);
}
