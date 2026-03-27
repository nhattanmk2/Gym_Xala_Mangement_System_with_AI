package com.xala.gym.repository;

import com.xala.gym.entity.MembershipPauseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipPauseHistoryRepository extends JpaRepository<MembershipPauseHistory, Long> {
    Optional<MembershipPauseHistory> findFirstByMembershipCardIdAndResumeDateIsNullOrderByCreatedAtDesc(Long membershipCardId);
}
