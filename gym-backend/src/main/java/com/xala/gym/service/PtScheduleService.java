package com.xala.gym.service;

import com.xala.gym.dto.request.PtScheduleRequest;
import com.xala.gym.dto.response.PtScheduleResponse;
import java.util.List;

public interface PtScheduleService {
    PtScheduleResponse addSlot(PtScheduleRequest request);
    List<PtScheduleResponse> batchAdd(List<PtScheduleRequest> requests);
    List<PtScheduleResponse> getMySchedule();
    List<PtScheduleResponse> getAvailableSlots(Long ptId);
    void deleteSlot(Long id);
}
