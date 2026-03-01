package com.xala.gym.service;

import com.xala.gym.dto.request.AdminUpdatePtRequest;
import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.entity.GymLocation;
import com.xala.gym.entity.Position;
import java.util.List;

public interface PtService {
    AdminPtResponse getMyProfile();
    AdminPtResponse updateMyProfile(AdminUpdatePtRequest request, byte[] avatarFile);
    List<Position> getAllPositions();
    List<GymLocation> getAllLocations();
    List<AdminPtResponse> getAllPts(Integer branchId);
}
