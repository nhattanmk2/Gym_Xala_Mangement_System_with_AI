package com.xala.gym.repository;

import com.xala.gym.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    // Tìm Member dựa trên userId (nếu cần)
    Optional<Member> findByUserId(Integer userId);
}
