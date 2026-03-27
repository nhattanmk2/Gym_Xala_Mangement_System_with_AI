package com.xala.gym.service;

import com.xala.gym.dto.request.MembershipRegistrationRequest;
import com.xala.gym.dto.response.MembershipCardResponse;

import java.util.List;

public interface MembershipCardService {
    MembershipCardResponse registerPackage(String username, MembershipRegistrationRequest request);
    List<MembershipCardResponse> getMyCards(String username);
    List<MembershipCardResponse> getMemberCards(Long memberId);
    MembershipCardResponse getCurrentCard(String username);
    void cancelCard(String username, Long cardId);
    void assignPt(String username, Long cardId, Long ptId);
    void approveCard(Long cardId, Double customPrice);
    void pauseCard(String username, Long cardId, String reason);
    void resumeCard(String username, Long cardId);
}
