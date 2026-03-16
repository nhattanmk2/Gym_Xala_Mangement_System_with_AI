package com.xala.gym.controller;

import com.xala.gym.dto.request.MembershipRegistrationRequest;
import com.xala.gym.dto.response.MembershipCardResponse;
import com.xala.gym.service.MembershipCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/packages")
@RequiredArgsConstructor
public class MemberPackageController {

    private final MembershipCardService membershipCardService;

    @PostMapping("/register")
    public ResponseEntity<MembershipCardResponse> registerPackage(@RequestBody @Valid MembershipRegistrationRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(membershipCardService.registerPackage(username, request));
    }

    @GetMapping("/my-cards")
    public ResponseEntity<List<MembershipCardResponse>> getMyCards() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(membershipCardService.getMyCards(username));
    }

    @GetMapping("/current")
    public ResponseEntity<MembershipCardResponse> getCurrentCard() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(membershipCardService.getCurrentCard(username));
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<Void> cancelCard(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        membershipCardService.cancelCard(username, id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{cardId}/assign-pt/{ptId}")
    public ResponseEntity<Void> assignPt(@PathVariable Long cardId, @PathVariable Long ptId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        membershipCardService.assignPt(username, cardId, ptId);
        return ResponseEntity.ok().build();
    }
}
