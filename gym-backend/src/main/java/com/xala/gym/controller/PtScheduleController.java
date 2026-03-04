package com.xala.gym.controller;

import com.xala.gym.dto.request.PtScheduleRequest;
import com.xala.gym.dto.response.PtClientResponse;
import com.xala.gym.dto.response.PtScheduleResponse;
import com.xala.gym.service.PtScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pt/schedule")
@RequiredArgsConstructor
public class PtScheduleController {

    private final PtScheduleService ptScheduleService;

    @GetMapping
    public ResponseEntity<List<PtScheduleResponse>> getMySchedules() {
        return ResponseEntity.ok(ptScheduleService.getMySchedule());
    }

    // ✅ Xem danh sách học viên của PT
    @GetMapping("/clients")
    public ResponseEntity<List<PtClientResponse>> getMyClients() {
        return ResponseEntity.ok(ptScheduleService.getMyClients());
    }

    @PostMapping
    public ResponseEntity<PtScheduleResponse> addSlot(@RequestBody PtScheduleRequest request) {
        return ResponseEntity.ok(ptScheduleService.addSlot(request));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<PtScheduleResponse>> batchAdd(@RequestBody List<PtScheduleRequest> requests) {
        return ResponseEntity.ok(ptScheduleService.batchAdd(requests));
    }

    @GetMapping("/available/{ptId}")
    public ResponseEntity<List<PtScheduleResponse>> getAvailableSlots(@PathVariable Long ptId) {
        return ResponseEntity.ok(ptScheduleService.getAvailableSlots(ptId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSlot(@PathVariable Long id) {
        ptScheduleService.deleteSlot(id);
        return ResponseEntity.ok("Xóa khung giờ thành công.");
    }

    @PutMapping("/{id}/content")
    public ResponseEntity<PtScheduleResponse> saveSessionContent(@PathVariable Long id, @RequestBody com.xala.gym.dto.request.WorkoutSessionContentRequest request) {
        return ResponseEntity.ok(ptScheduleService.saveSessionContent(id, request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<String> markSessionAsCompleted(@PathVariable Long id) {
        ptScheduleService.markSessionAsCompleted(id);
        return ResponseEntity.ok("Xác nhận hoàn thành buổi tập thành công");
    }

    @PostMapping("/book/{id}")
    public ResponseEntity<PtScheduleResponse> bookSlot(@PathVariable Long id) {
        return ResponseEntity.ok(ptScheduleService.bookSlot(id));
    }

    @GetMapping("/history/{memberId}")
    public ResponseEntity<List<PtScheduleResponse>> getMemberTrainingHistory(@PathVariable Long memberId) {
        return ResponseEntity.ok(ptScheduleService.getMemberTrainingHistory(memberId));
    }

    @GetMapping("/progress/{memberId}")
    public ResponseEntity<List<com.xala.gym.dto.response.MemberExerciseProgressResponse>> getMemberExerciseProgress(@PathVariable Long memberId) {
        return ResponseEntity.ok(ptScheduleService.getMemberExerciseProgress(memberId));
    }

    @GetMapping("/stats/monthly-completed")
    public ResponseEntity<Long> getMonthlyCompletedSessionsCount() {
        return ResponseEntity.ok(ptScheduleService.getMonthlyCompletedSessionsCount());
    }

    @GetMapping("/stats/clients-count")
    public ResponseEntity<Long> getManagedClientsCount() {
        return ResponseEntity.ok(ptScheduleService.getManagedClientsCount());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<PtScheduleResponse>> getUpcomingSchedules(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ptScheduleService.getUpcomingSchedules(limit));
    }
}
