package com.xala.gym.controller;

import com.xala.gym.dto.request.AdminCreateMemberRequest;
import com.xala.gym.dto.request.AdminUpdateMemberRequest;
import com.xala.gym.dto.response.AdminMemberResponse;
import com.xala.gym.service.AdminMemberService;
import com.xala.gym.service.MemberService;
import com.xala.gym.service.impl.AdminMemberServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.xala.gym.service.MembershipCardService;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.dto.response.MembershipCardResponse;
import com.xala.gym.service.AIConsultationService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMemberController {

    private final AdminMemberService memberService;
    private final MembershipCardService membershipCardService;
    private final MembershipCardRepository cardRepository;
    private final AIConsultationService aiConsultationService;
    private final com.xala.gym.repository.MemberRepository memberRepository;

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
            @PathVariable("id") Long id,
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
            @PathVariable("id") Long id,
            @RequestBody AdminUpdateMemberRequest request
    ) {

        AdminMemberResponse response =
                memberService.updateMember(id, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<String> deleteMember(@PathVariable("id") Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok("Xóa học viên thành công");
    }

    @PutMapping("/members/{id}/upgrade-pt")
    public ResponseEntity<String> upgradeToPt(@PathVariable("id") Long id) {
        memberService.upgradeToPt(id);
        return ResponseEntity.ok("Nâng cấp hội viên lên PT thành công");
    }

    // ✅ API: Lấy AI History của một Hội viên cụ thể (Giới hạn 1 session mới nhất để tham khảo giá)
    @GetMapping("/members/{id}/ai-history")
    public ResponseEntity<java.util.List<com.xala.gym.entity.AIConsultationHistory>> getMemberAiHistory(@PathVariable("id") Long memberId) {
        com.xala.gym.entity.Member member = memberRepository.findById(memberId).orElse(null);
        if (member == null) return ResponseEntity.ok(java.util.List.of());
        return ResponseEntity.ok(aiConsultationService.getHistory(member.getUser().getUsername()));
    }

    // ✅ API: Lấy danh sách Thẻ tập của một Hội viên
    @GetMapping("/members/{id}/memberships")
    public ResponseEntity<List<MembershipCardResponse>> getMemberMemberships(@PathVariable("id") Long memberId) {
        return ResponseEntity.ok(membershipCardService.getMemberCards(memberId));
    }

    // ✅ API: Duyệt Gói Tập (MembershipCard) với Custom Price
    @PutMapping("/memberships/{id}/approve")
    public ResponseEntity<String> approveMembership(
            @PathVariable("id") Long id,
            @RequestParam(required = false) Double customPrice
    ) {
        membershipCardService.approveCard(id, customPrice);
        return ResponseEntity.ok("Duyệt gói tập thành công");
    }
}