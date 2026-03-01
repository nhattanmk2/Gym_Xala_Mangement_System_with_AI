package com.xala.gym.repository;

import com.xala.gym.entity.Booking;
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
}
