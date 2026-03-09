package com.xala.gym.repository;

import com.xala.gym.entity.GymEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GymEquipmentRepository extends JpaRepository<GymEquipment, Long> {
}
