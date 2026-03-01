package com.xala.gym.repository;

import com.xala.gym.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUser_Id(Long userId);
    
    Optional<Employee> findByUserUsername(String username);

    @Query("SELECT e FROM Employee e JOIN e.user u JOIN u.roles r " +
           "WHERE r.name = 'ROLE_PT' " +
           "AND (:name = '' OR e.name LIKE CONCAT('%', :name, '%')) " +
           "AND (:phone = '' OR e.phone LIKE CONCAT('%', :phone, '%'))")
    List<Employee> searchPTs(@Param("name") String name, @Param("phone") String phone);
}
