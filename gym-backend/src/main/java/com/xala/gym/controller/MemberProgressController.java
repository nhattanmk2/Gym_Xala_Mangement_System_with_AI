package com.xala.gym.controller;

import com.xala.gym.dto.response.MemberProgressResponse;
import com.xala.gym.service.MemberProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member/progress")
@RequiredArgsConstructor
public class MemberProgressController {

    private final MemberProgressService progressService;

    @GetMapping("/{membershipCardId}")
    public ResponseEntity<MemberProgressResponse> getProgress(@PathVariable Long membershipCardId) {
        return ResponseEntity.ok(progressService.getMemberProgress(membershipCardId));
    }

    @PostMapping("/{membershipCardId}/toggle/{sessionExerciseId}")
    public ResponseEntity<?> toggleExerciseStatus(
            @PathVariable Long membershipCardId,
            @PathVariable Long sessionExerciseId) {
        progressService.toggleExerciseStatus(membershipCardId, sessionExerciseId);
        return ResponseEntity.ok().build();
    }
}
