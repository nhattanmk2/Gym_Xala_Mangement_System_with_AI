package com.xala.gym.controller;

import com.xala.gym.dto.response.AdminMemberResponse;
import com.xala.gym.service.impl.AdminMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    // ✅ API: Admin lấy danh sách học viên + filter name/cccd
    @GetMapping("/members")
    public List<AdminMemberResponse> getMembers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cccd
    ) {
        return adminMemberService.getAllMembers(name, cccd);
    }
}