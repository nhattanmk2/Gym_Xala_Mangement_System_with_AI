package com.xala.gym.repository;

import com.xala.gym.entity.WorkoutRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRoadmapRepository extends JpaRepository<WorkoutRoadmap, Long> {
    List<WorkoutRoadmap> findByGymPackageIdOrderByOrderIndexAsc(Long packageId);
    List<WorkoutRoadmap> findByGymPackageId(Long packageId);
}
