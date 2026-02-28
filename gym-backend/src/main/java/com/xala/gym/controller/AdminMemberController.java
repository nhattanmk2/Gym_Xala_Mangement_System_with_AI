package com.xala.gym.controller;

import com.xala.gym.dto.request.AdminCreateMemberRequest;
import com.xala.gym.dto.response.AdminMemberResponse;
import com.xala.gym.service.AdminMemberService;
import com.xala.gym.service.MemberService;
import com.xala.gym.service.impl.AdminMemberServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService memberService;

    // ✅ API: Admin lấy danh sách học viên + filter name/cccd
    @GetMapping("/members")
    public List<AdminMemberResponse> getMembers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cccd,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String sex,
            @RequestParam(required = false) Boolean status
    ) {
        return memberService.getAllMembers(name, cccd, email, phone, sex);
    }

    @PutMapping("/members/{id}/status")
    public String updateMemberStatus(
            @PathVariable Integer id,
            @RequestParam boolean status
    ) {
        memberService.updateMemberStatus(id, status);
        return "Cập nhật trạng thái thành công";
    }

    @PostMapping("/members/create")
    public ResponseEntity<AdminMemberResponse> createMember(
            @RequestBody AdminCreateMemberRequest request) {

        AdminMemberResponse response = memberService.createMember(request);
        return ResponseEntity.ok(response);
    }
}