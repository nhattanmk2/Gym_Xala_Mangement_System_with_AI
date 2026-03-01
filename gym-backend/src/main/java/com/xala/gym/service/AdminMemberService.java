package com.xala.gym.service;

import com.xala.gym.dto.request.AdminCreateMemberRequest;
import com.xala.gym.dto.request.AdminUpdateMemberRequest;
import com.xala.gym.dto.response.AdminMemberResponse;

import java.util.List;

public interface AdminMemberService {

    AdminMemberResponse createMember(AdminCreateMemberRequest request);

    List<AdminMemberResponse> getAllMembers(String name, String cccd, String email, String phone, String sex);

    void updateMemberStatus(Long memberId, boolean status);

    AdminMemberResponse updateMember(
            Long memberId,
            AdminUpdateMemberRequest request
    );

    void deleteMember(Long memberId);

    void upgradeToPt(Long memberId);
}