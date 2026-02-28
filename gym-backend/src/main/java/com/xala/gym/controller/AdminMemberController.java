package com.xala.gym.controller;

import com.xala.gym.dto.request.AdminCreateMemberRequest;
import com.xala.gym.dto.request.AdminUpdateMemberRequest;
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
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "cccd", required = false) String cccd,
            @RequestParam(name = "email", required = false) String email,
            @RequestParam(name = "phone", required = false) String phone,
            @RequestParam(name = "sex", required = false) String sex,
            @RequestParam(name = "status", required = false) Boolean status
    ) {
        return memberService.getAllMembers(name, cccd, email, phone, sex);
    }

    @PutMapping("/members/{id}/status")
    public String updateMemberStatus(
            @PathVariable("id") Integer id,
            @RequestParam("status") boolean status
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

    @PutMapping("/members/{id}")
    public ResponseEntity<AdminMemberResponse> updateMember(
            @PathVariable("id") Integer id,
            @RequestBody AdminUpdateMemberRequest request
    ) {

        AdminMemberResponse response =
                memberService.updateMember(id, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<String> deleteMember(@PathVariable("id") Integer id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok("Xóa học viên thành công");
    }
}