package com.xala.gym.controller;

import com.xala.gym.dto.request.PtScheduleRequest;
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
    public ResponseEntity<List<PtScheduleResponse>> getMySchedule() {
        return ResponseEntity.ok(ptScheduleService.getMySchedule());
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

    @PostMapping("/book/{id}")
    public ResponseEntity<PtScheduleResponse> bookSlot(@PathVariable Long id) {
        return ResponseEntity.ok(ptScheduleService.bookSlot(id));
    }
}
