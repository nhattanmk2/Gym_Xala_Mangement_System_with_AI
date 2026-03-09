package com.xala.gym.service;

import com.xala.gym.dto.response.MemberProgressResponse;

public interface MemberProgressService {
    MemberProgressResponse getMemberProgress(Long membershipCardId);
    void toggleExerciseStatus(Long membershipCardId, Long sessionExerciseId);
}
