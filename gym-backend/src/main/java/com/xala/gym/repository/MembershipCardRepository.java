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
    List<MembershipCard> findByMember_User_Id(Long userId);
    Optional<MembershipCard> findFirstByMemberIdAndStatusOrderByEndDateDesc(Long memberId, String status);
    @Query("SELECT mc FROM MembershipCard mc WHERE mc.assignedPt.user.id = :userId")
    List<MembershipCard> findByAssignedPt_User_Id(@Param("userId") Long userId);

    long countByStatus(String status);

    @Query("SELECT m FROM MembershipCard m JOIN FETCH m.member JOIN FETCH m.gymPackage WHERE m.createdAt >= :startDate AND m.createdAt <= :endDate")
    List<MembershipCard> findAllByCreatedAtBetweenWithMemberAndPackage(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );

    @Query("SELECT m FROM MembershipCard m JOIN FETCH m.member JOIN FETCH m.gymPackage JOIN FETCH m.member.gymLocation")
    List<MembershipCard> findAllWithMemberPackageAndLocation();

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

    @Query("SELECT SUM(p.price) FROM MembershipCard mc JOIN mc.gymPackage p WHERE MONTH(mc.createdAt) = :month AND YEAR(mc.createdAt) = :year AND mc.status = 'ACTIVE'")
    Double calculateRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Đếm số lượng membership đăng ký nhóm theo ngày để vẽ Chart
    @Query("SELECT new map(FUNCTION('DATE', mc.createdAt) as regDate, COUNT(mc.id) as count) " +
           "FROM MembershipCard mc " +
           "WHERE mc.createdAt >= :startDate " +
           "GROUP BY FUNCTION('DATE', mc.createdAt) " +
           "ORDER BY FUNCTION('DATE', mc.createdAt) ASC")
    List<java.util.Map<String, Object>> countMembershipsGroupedByDate(@Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT COUNT(DISTINCT mc.member.id) FROM MembershipCard mc WHERE mc.createdAt < :startDate")
    long countDistinctMembersBeforeDate(@Param("startDate") java.time.LocalDateTime startDate);
}
