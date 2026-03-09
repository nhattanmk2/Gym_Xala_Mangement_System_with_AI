package com.xala.gym.service;

import com.xala.gym.dto.request.PtScheduleRequest;
import com.xala.gym.dto.response.PtClientResponse;
import com.xala.gym.dto.response.PtScheduleResponse;
import java.util.List;

public interface PtScheduleService {
    PtScheduleResponse addSlot(PtScheduleRequest request);
    List<PtScheduleResponse> batchAdd(List<PtScheduleRequest> requests);
    List<PtScheduleResponse> getMySchedule(java.time.LocalDate startDate, java.time.LocalDate endDate);
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
    void cancelBookingByMember(Long slotId);
    List<PtScheduleResponse> getPendingBookings();
    List<PtScheduleResponse> getMemberBookings(java.time.LocalDate startDate, java.time.LocalDate endDate);
    List<PtClientResponse> getMyClients();
    PtScheduleResponse getScheduleById(Long id);
    PtScheduleResponse saveSessionContent(Long slotId, com.xala.gym.dto.request.WorkoutSessionContentRequest request);
    
    List<PtScheduleResponse> getMemberTrainingHistory(Long memberId);
    List<com.xala.gym.dto.response.MemberExerciseProgressResponse> getMemberExerciseProgress(Long memberId);
    long getMonthlyCompletedSessionsCount();
    
    long getManagedClientsCount();
    List<PtScheduleResponse> getUpcomingSchedules(int limit);
    
    com.xala.gym.dto.response.WeeklyStatsResponse getMemberWeeklyStats();
    
    // PT confirmed completion
    void markSessionAsCompleted(Long slotId);
}
