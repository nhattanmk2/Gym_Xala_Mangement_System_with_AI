package com.xala.gym.controller;

import com.xala.gym.dto.request.AIConsultationRequest;
import com.xala.gym.dto.response.AIConsultationResponse;
import com.xala.gym.service.AIConsultationService;
import lombok.RequiredArgsConstructor;
import com.xala.gym.entity.AIConsultationHistory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/ai-consultation")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AIConsultationController {

    private final AIConsultationService aiConsultationService;

    @PostMapping
    public ResponseEntity<AIConsultationResponse> getConsultation(@RequestBody AIConsultationRequest request) {
        return ResponseEntity.ok(aiConsultationService.getConsultation(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AIConsultationHistory>> getHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(aiConsultationService.getHistory(username));
    }
}
