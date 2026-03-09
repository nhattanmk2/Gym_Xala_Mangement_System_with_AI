package com.xala.gym.repository;

import com.xala.gym.entity.StandardExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StandardExerciseRepository extends JpaRepository<StandardExercise, Long> {
    List<StandardExercise> findByCategoryId(Long categoryId);
}
