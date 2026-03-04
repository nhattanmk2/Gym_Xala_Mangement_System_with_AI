package com.xala.gym.controller;

import com.xala.gym.dto.request.PtMatchingRequest;
import com.xala.gym.dto.response.PtMatchingResponse;
import com.xala.gym.service.PtMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/pt-matching")
@RequiredArgsConstructor
public class PtMatchingController {

    private final PtMatchingService ptMatchingService;

    @PostMapping("/match")
    public ResponseEntity<List<PtMatchingResponse>> matchPTs(@RequestBody PtMatchingRequest request) {
        List<PtMatchingResponse> matches = ptMatchingService.matchPt(request);
        return ResponseEntity.ok(matches);
    }
}
