package com.xala.gym.repository;

import com.xala.gym.entity.GymLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GymLocationRepository extends JpaRepository<GymLocation, Integer> {
}