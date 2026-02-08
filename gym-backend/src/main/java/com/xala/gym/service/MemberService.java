package com.xala.gym.service;

import com.xala.gym.dto.response.MemberProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MemberService {

    MemberProfileResponse getMyProfile();

    // ✅ Thêm dòng này
    void updateAvatar(MultipartFile file);
}
