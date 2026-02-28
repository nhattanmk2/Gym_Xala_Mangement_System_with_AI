package com.xala.gym.service;

import com.xala.gym.dto.request.AdminCreatePtRequest;
import com.xala.gym.dto.request.AdminUpdatePtRequest;
import com.xala.gym.dto.response.AdminPtResponse;
import java.util.List;

public interface AdminPtService {
    List<AdminPtResponse> getAllPts(String name, String phone);
    void downgradeToMember(Long userId);
    void deletePtCompletely(Long userId);
    AdminPtResponse createPt(AdminCreatePtRequest request);
    AdminPtResponse getPtDetail(Long id);
    AdminPtResponse updatePt(Long id, AdminUpdatePtRequest request, byte[] avatarFile);
}
