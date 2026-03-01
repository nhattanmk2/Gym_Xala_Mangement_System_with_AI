package com.xala.gym.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xala.gym.dto.request.AdminUpdatePtRequest;
import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.entity.GymLocation;
import com.xala.gym.entity.Position;
import com.xala.gym.service.PtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pt")
@RequiredArgsConstructor
public class PtController {

    private final PtService ptService;
    private final ObjectMapper objectMapper;

    @GetMapping("/profile")
    public ResponseEntity<AdminPtResponse> getMyProfile() {
        return ResponseEntity.ok(ptService.getMyProfile());
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminPtResponse> updateMyProfile(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) throws Exception {
        AdminUpdatePtRequest request = objectMapper.readValue(dataJson, AdminUpdatePtRequest.class);
        byte[] avatarBytes = avatar != null ? avatar.getBytes() : null;
        return ResponseEntity.ok(ptService.updateMyProfile(request, avatarBytes));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<AdminPtResponse> updateAvatar(@RequestParam("file") MultipartFile file) throws Exception {
        AdminUpdatePtRequest request = new AdminUpdatePtRequest();
        return ResponseEntity.ok(ptService.updateMyProfile(request, file.getBytes()));
    }

    @GetMapping("/positions")
    public List<Position> getAllPositions() {
        return ptService.getAllPositions();
    }

    @GetMapping("/locations")
    public List<GymLocation> getAllLocations() {
        return ptService.getAllLocations();
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminPtResponse>> getAllPts(@RequestParam(value = "branchId", required = false) Integer branchId) {
        return ResponseEntity.ok(ptService.getAllPts(branchId));
    }
}
