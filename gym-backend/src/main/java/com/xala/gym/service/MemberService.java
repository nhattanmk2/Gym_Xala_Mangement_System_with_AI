package com.xala.gym.service;

import com.xala.gym.dto.response.AdminMemberResponse;
import com.xala.gym.dto.response.MemberProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MemberService {

    MemberProfileResponse getMyProfile();

    // ✅ Thêm dòng này
    void updateAvatar(MultipartFile file);

    void updateMyProfile(com.xala.gym.dto.request.UserUpdateProfileRequest request);
}
