package com.xala.gym.repository;

import com.xala.gym.entity.MembershipCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipCardRepository extends JpaRepository<MembershipCard, Long> {
    List<MembershipCard> findByMemberId(Integer memberId);
    Optional<MembershipCard> findFirstByMemberIdAndStatusOrderByEndDateDesc(Integer memberId, String status);

    @Query("SELECT COUNT(m) > 0 FROM MembershipCard m WHERE m.member.id = :memberId AND m.status = :status")
    boolean existsByMemberIdAndStatus(@Param("memberId") Integer memberId, @Param("status") String status);
}
