package com.xala.gym.controller;

import com.xala.gym.dto.response.MemberProfileResponse;
import com.xala.gym.service.MemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    // ✅ API Upload Avatar
    @PutMapping("/avatar")
    public String uploadAvatar(@RequestParam("file") MultipartFile file) {
        memberService.updateAvatar(file);
        return "Upload avatar thành công!";
    }
}

