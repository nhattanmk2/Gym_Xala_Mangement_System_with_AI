package com.xala.gym.service;

import com.xala.gym.dto.request.PtScheduleRequest;
import com.xala.gym.dto.response.PtScheduleResponse;
import java.util.List;

public interface PtScheduleService {
    PtScheduleResponse addSlot(PtScheduleRequest request);
    List<PtScheduleResponse> batchAdd(List<PtScheduleRequest> requests);
    List<PtScheduleResponse> getMySchedule();
    List<PtScheduleResponse> getAvailableSlots(Long ptId);
    List<PtScheduleResponse> getAdminSchedules(Integer branchId, String ptName, String status);
    void deleteSlot(Long id);
    PtScheduleResponse adminUpdateSlot(Long id, PtScheduleRequest request);
    void adminDeleteSlot(Long id);
    List<PtScheduleResponse> adminBatchAdd(Long ptId, List<PtScheduleRequest> requests);
    
    // Booking logic
    PtScheduleResponse bookSlot(Long slotId);
    void approveBooking(Long slotId);
    void rejectBooking(Long slotId);
    List<PtScheduleResponse> getPendingBookings();
    List<PtScheduleResponse> getMemberBookings();
}
