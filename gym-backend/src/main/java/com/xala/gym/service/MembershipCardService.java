package com.xala.gym.service;

import com.xala.gym.dto.request.MembershipRegistrationRequest;
import com.xala.gym.dto.response.MembershipCardResponse;

import java.util.List;

public interface MembershipCardService {
    MembershipCardResponse registerPackage(String username, MembershipRegistrationRequest request);
    List<MembershipCardResponse> getMyCards(String username);
    MembershipCardResponse getCurrentCard(String username);
    void cancelCard(String username, Long cardId);
}
