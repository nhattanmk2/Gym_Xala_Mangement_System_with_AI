package com.xala.gym.controller;

import com.xala.gym.dto.response.PtScheduleResponse;
import com.xala.gym.service.PtScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final PtScheduleService ptScheduleService;

    @GetMapping("/pending")
    public ResponseEntity<List<PtScheduleResponse>> getPendingBookings() {
        return ResponseEntity.ok(ptScheduleService.getPendingBookings());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveBooking(@PathVariable Long id) {
        ptScheduleService.approveBooking(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectBooking(@PathVariable Long id) {
        ptScheduleService.rejectBooking(id);
        return ResponseEntity.ok().build();
    }
}
