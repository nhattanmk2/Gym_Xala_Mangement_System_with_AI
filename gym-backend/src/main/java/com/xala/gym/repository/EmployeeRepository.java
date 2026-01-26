package com.xala.gym.repository;

import com.xala.gym.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // Có thể thêm method tìm kiếm theo vị trí nếu cần
    // List<Employee> findByPositionId(Integer positionId);
}
