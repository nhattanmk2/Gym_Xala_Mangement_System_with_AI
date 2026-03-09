package com.xala.gym.repository;

import com.xala.gym.entity.SessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionExerciseRepository extends JpaRepository<SessionExercise, Long> {
    List<SessionExercise> findBySessionIdOrderByOrderIndexAsc(Long sessionId);
}
