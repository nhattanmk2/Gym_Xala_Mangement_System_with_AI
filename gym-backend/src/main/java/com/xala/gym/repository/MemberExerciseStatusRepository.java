package com.xala.gym.repository;

import com.xala.gym.entity.MemberExerciseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MemberExerciseStatusRepository extends JpaRepository<MemberExerciseStatus, Long> {
    List<MemberExerciseStatus> findByMembershipCard_Id(Long membershipCardId);
    Optional<MemberExerciseStatus> findByMembershipCard_IdAndExercise_Id(Long membershipCardId, Long exerciseId);
    List<MemberExerciseStatus> findByMembershipCard_Member_IdOrderByCompletedAtDesc(Long memberId);
}
