package com.xala.gym.repository;

import com.xala.gym.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {

    Optional<Member> findByUser_Id(Integer userId);

    Optional<Member> findByUserUsername(String username);

    // ✅ ADMIN: Search theo name + cccd
    @Query("""
        SELECT m FROM Member m
        WHERE (:name IS NULL OR :name = '' OR m.name LIKE CONCAT('%', :name, '%'))
        AND (:cccd IS NULL OR :cccd = '' OR m.cccd = :cccd)
    """)
    List<Member> searchMembers(
            @Param("name") String name,
            @Param("cccd") String cccd
    );
}