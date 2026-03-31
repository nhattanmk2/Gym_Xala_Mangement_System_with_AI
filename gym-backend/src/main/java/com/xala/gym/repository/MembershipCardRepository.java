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
    boolean existsByGymPackageId(Long packageId);
    boolean existsByMemberIdAndStatusIn(Long memberId, List<String> statuses);
    List<MembershipCard> findByMemberId(Long memberId);
    List<MembershipCard> findByMember_User_Id(Long userId);
    Optional<MembershipCard> findFirstByMemberIdAndStatusOrderByEndDateDesc(Long memberId, String status);
    Optional<MembershipCard> findFirstByMemberIdAndStatusInOrderByEndDateDesc(Long memberId, List<String> statuses);
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

    @Query("SELECT m FROM MembershipCard m WHERE (:status IS NULL OR :status = '' OR :status = 'ALL' OR m.status = :status) " +
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

    // Đếm số lượng membership đăng ký nhóm theo ngày để vẽ Chart (có dải ngày)
    @Query("SELECT new map(FUNCTION('DATE', mc.createdAt) as regDate, COUNT(mc.id) as count) " +
           "FROM MembershipCard mc " +
           "WHERE mc.createdAt >= :startDate AND mc.createdAt <= :endDate " +
           "GROUP BY FUNCTION('DATE', mc.createdAt) " +
           "ORDER BY FUNCTION('DATE', mc.createdAt) ASC")
    List<java.util.Map<String, Object>> countMembershipsGroupedByDate(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    // Đếm số lượng membership đăng ký nhóm theo tháng để vẽ Chart năm
    @Query("SELECT new map(MONTH(mc.createdAt) as month, YEAR(mc.createdAt) as year, COUNT(mc.id) as count) " +
           "FROM MembershipCard mc " +
           "WHERE mc.createdAt >= :startDate AND mc.createdAt <= :endDate " +
           "GROUP BY YEAR(mc.createdAt), MONTH(mc.createdAt) " +
           "ORDER BY YEAR(mc.createdAt) ASC, MONTH(mc.createdAt) ASC")
    List<java.util.Map<String, Object>> countMembershipsGroupedByMonth(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT mc.member.id) FROM MembershipCard mc WHERE mc.createdAt < :startDate")
    long countDistinctMembersBeforeDate(@Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT new map(mc.assignedPt.user.id as ptId, mc.assignedPt.user.fullName as ptName, COUNT(mc.id) as soldPackages, SUM(p.price) as revenue) " +
           "FROM MembershipCard mc JOIN mc.gymPackage p " +
           "WHERE mc.assignedPt IS NOT NULL " +
           "AND mc.status = 'ACTIVE' " +
           "AND mc.createdAt >= :startDate AND mc.createdAt <= :endDate " +
           "GROUP BY mc.assignedPt.user.id, mc.assignedPt.user.fullName")
    List<java.util.Map<String, Object>> getPtSalesStatsByDate(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    // Lấy doanh thu theo tháng (năm và tháng) - Dùng Native Query cho ổn định tuyệt đối (có dải ngày)
    @Query(value = "SELECT MONTH(mc.created_at) as month, YEAR(mc.created_at) as year, SUM(COALESCE(mc.custom_price, p.price)) as revenue " +
           "FROM membership_cards mc JOIN packages p ON mc.package_id = p.id " +
           "WHERE mc.status = 'ACTIVE' " +
           "AND mc.created_at >= :startDate AND mc.created_at <= :endDate " +
           "GROUP BY YEAR(mc.created_at), MONTH(mc.created_at) " +
           "ORDER BY year ASC, month ASC", nativeQuery = true)
    List<Object[]> getMonthlyRevenueStats(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    // Lấy danh sách thẻ tập có hiệu lực trong khoảng thời gian để tính Active Members Trend
    @Query("SELECT mc FROM MembershipCard mc " +
           "WHERE mc.status = 'ACTIVE' " +
           "AND mc.startDate <= :endDate " +
           "AND mc.endDate >= :startDate")
    List<MembershipCard> findAllActiveInPeriod(@Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
}
