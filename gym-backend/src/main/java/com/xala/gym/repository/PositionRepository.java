package com.xala.gym.repository;

import com.xala.gym.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionRepository extends JpaRepository<Position, Integer> {
    // Tìm vị trí theo tên (ví dụ để tìm ID của PT)
    // Optional<Position> findByName(String name);
}