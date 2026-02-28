package com.xala.gym.repository;

import com.xala.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Thêm dòng này để Spring Data JPA tự động tạo query kiểm tra email
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r " +
           "WHERE r.name = 'ROLE_PT' " +
           "AND (:name = '' OR u.fullName LIKE CONCAT('%', :name, '%')) " +
           "AND (:phone = '' OR u.phone LIKE CONCAT('%', :phone, '%'))")
    List<User> searchPTs(@Param("name") String name, @Param("phone") String phone);
}