package com.xala.gym.repository;

import com.xala.gym.entity.Booking;
import com.xala.gym.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.personalTrainer.id = :ptId " +
           "AND b.startTime < :endTime AND b.endTime > :startTime AND b.status != 'CANCELLED'")
    List<Booking> findOverlappingSlots(
            @Param("ptId") Long ptId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<Booking> findByPersonalTrainerIdOrderByStartTimeAsc(Long ptId);

    List<Booking> findByPersonalTrainerIdAndStartTimeBetweenOrderByStartTimeAsc(
            Long ptId, LocalDateTime start, LocalDateTime end
    );

    @Query("SELECT b FROM Booking b " +
           "JOIN b.personalTrainer u " +
           "WHERE (:branchId IS NULL OR EXISTS (SELECT e FROM Employee e WHERE e.user.id = u.id AND e.gymLocation.id = :branchId)) " +
           "AND (:ptName IS NULL OR :ptName = '' OR u.fullName LIKE %:ptName%) " +
           "AND (:status IS NULL OR :status = '' OR b.status = :status) " +
           "ORDER BY b.startTime DESC")
    List<Booking> searchSchedules(
            @Param("branchId") Integer branchId,
            @Param("ptName") String ptName,
            @Param("status") String status
    );

    @Query("SELECT COUNT(b) FROM Booking b " +
           "JOIN b.personalTrainer u " +
           "JOIN Employee e ON e.user.id = u.id " +
           "WHERE e.gymLocation.id = :branchId " +
           "AND b.status IN ('PENDING', 'CONFIRMED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    long countBookingsInBranchAtInterval(
            @Param("branchId") Integer branchId,
            @Param("startTime") java.time.LocalDateTime startTime,
            @Param("endTime") java.time.LocalDateTime endTime
    );

    List<Booking> findByStatusOrderByStartTimeDesc(String status);

    List<Booking> findByMemberIdOrderByStartTimeDesc(Long memberId);

    List<Booking> findByMemberIdAndPersonalTrainerIdOrderByStartTimeDesc(Long memberId, Long ptId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.personalTrainer.id = :ptId AND b.status = 'COMPLETED' AND MONTH(b.startTime) = :month AND YEAR(b.startTime) = :year")
    long countCompletedSessionsByPtIdAndMonthAndYear(@Param("ptId") Long ptId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT b FROM Booking b WHERE b.personalTrainer.id = :ptId AND (b.status = 'CONFIRMED' OR b.status = 'PENDING') AND b.startTime >= :currentTime ORDER BY b.startTime ASC")
    List<Booking> findUpcomingSchedulesByPtId(@Param("ptId") Long ptId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT DISTINCT m FROM Member m WHERE m.user IN (SELECT b.member FROM Booking b WHERE b.personalTrainer.id = :ptId AND b.status != 'CANCELLED')")
    List<Member> findDistinctMembersByPtId(@Param("ptId") Long ptId);

    // Xếp hạng PT theo số Session đã hoàn thành
    @Query("SELECT new map(b.personalTrainer.id as ptId, b.personalTrainer.fullName as ptName, b.personalTrainer.averageRating as rating, COUNT(b) as completedSessions) " +
           "FROM Booking b " +
           "WHERE b.status = 'COMPLETED' " +
           "AND b.startTime >= :startDate " +
           "GROUP BY b.personalTrainer.id, b.personalTrainer.fullName, b.personalTrainer.averageRating " +
           "ORDER BY COUNT(b) DESC")
    List<java.util.Map<String, Object>> getPtRankingByCompletedSessions(@Param("startDate") java.time.LocalDateTime startDate);
}
