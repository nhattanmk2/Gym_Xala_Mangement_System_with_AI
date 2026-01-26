package com.xala.gym.repository;

import com.xala.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // Thêm dòng này để Spring Data JPA tự động tạo query kiểm tra email
    boolean existsByEmail(String email);
}