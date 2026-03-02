package com.xala.gym.controller;

import com.xala.gym.dto.response.MemberProfileResponse;
import com.xala.gym.service.MemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final com.xala.gym.service.PtScheduleService ptScheduleService;

    // ✅ API Profile
    @GetMapping("/profile")
    public MemberProfileResponse getMyProfile() {
        return memberService.getMyProfile();
    }

    // ✅ API Get My Schedule
    @GetMapping("/schedule")
    public ResponseEntity<java.util.List<com.xala.gym.dto.response.PtScheduleResponse>> getMySchedule() {
        return ResponseEntity.ok(ptScheduleService.getMemberBookings());
    }

    // ✅ API Get Schedule Details
    @GetMapping("/schedule/{id}")
    public ResponseEntity<com.xala.gym.dto.response.PtScheduleResponse> getScheduleDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ptScheduleService.getScheduleById(id));
    }

    // ✅ API Cancel Schedule Booking
    @PutMapping("/schedule/{id}/cancel")
    public ResponseEntity<?> cancelSchedule(@PathVariable Long id) {
        ptScheduleService.cancelBookingByMember(id);
        return ResponseEntity.ok("Hủy lịch thành công.");
    }

    // ✅ API Upload Avatar
    @PutMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {

        memberService.updateAvatar(file);

        return ResponseEntity.ok("Upload avatar thành công");
    }
}

