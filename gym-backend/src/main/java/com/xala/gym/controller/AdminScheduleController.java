package com.xala.gym.controller;

import com.xala.gym.dto.response.PtScheduleResponse;
import com.xala.gym.service.PtScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminScheduleController {

    private final PtScheduleService ptScheduleService;

    @GetMapping
    public ResponseEntity<List<PtScheduleResponse>> getAllSchedules(
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) String ptName,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ptScheduleService.getAdminSchedules(branchId, ptName, status));
    }

    @PostMapping("/batch/{ptId}")
    public ResponseEntity<?> adminBatchAdd(@PathVariable Long ptId, @RequestBody List<com.xala.gym.dto.request.PtScheduleRequest> requests) {
        try {
            return ResponseEntity.ok(ptScheduleService.adminBatchAdd(ptId, requests));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody com.xala.gym.dto.request.PtScheduleRequest request) {
        try {
            return ResponseEntity.ok(ptScheduleService.adminUpdateSlot(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        try {
            ptScheduleService.adminDeleteSlot(id);
            return ResponseEntity.ok("Xóa khung giờ thành công.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
