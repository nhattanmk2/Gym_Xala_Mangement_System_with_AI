package com.xala.gym.repository;

import com.xala.gym.entity.AIConsultationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIConsultationHistoryRepository extends JpaRepository<AIConsultationHistory, Long> {
    List<AIConsultationHistory> findByMember_IdOrderByConsultationTimeDesc(Long memberId);
}
