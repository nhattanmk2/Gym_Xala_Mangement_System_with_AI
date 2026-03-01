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
    List<MembershipCard> findByMemberId(Long memberId);
    Optional<MembershipCard> findFirstByMemberIdAndStatusOrderByEndDateDesc(Long memberId, String status);

    @Query("SELECT COUNT(m) > 0 FROM MembershipCard m WHERE m.member.id = :memberId AND m.status = :status")
    boolean existsByMemberIdAndStatus(@Param("memberId") Long memberId, @Param("status") String status);

    @Query("SELECT m FROM MembershipCard m WHERE m.status = :status " +
           "AND (:memberId IS NULL OR m.member.id = :memberId) " +
           "AND (:startDate IS NULL OR m.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR m.createdAt <= :endDate) " +
           "ORDER BY m.createdAt DESC")
    List<MembershipCard> findInvoicesByFilters(
            @Param("status") String status,
            @Param("memberId") Long memberId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );
}
