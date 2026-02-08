package com.xala.gym.controller;

import com.xala.gym.dto.response.MemberProfileResponse;
import com.xala.gym.service.MemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    // ✅ API Profile
    @GetMapping("/profile")
    public MemberProfileResponse getMyProfile() {
        return memberService.getMyProfile();
    }
}
