package com.xala.gym.controller;

import com.xala.gym.dto.request.AdminCreatePtRequest;
import com.xala.gym.dto.request.AdminUpdatePtRequest;
import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.entity.GymLocation;
import com.xala.gym.entity.Position;
import com.xala.gym.repository.GymLocationRepository;
import com.xala.gym.repository.PositionRepository;
import com.xala.gym.service.AdminPtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/pts")
@RequiredArgsConstructor
public class AdminPtController {

    private final AdminPtService adminPtService;
    private final PositionRepository positionRepository;
    private final GymLocationRepository gymLocationRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<AdminPtResponse> getPts(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "phone", required = false) String phone
    ) {
        log.info("API GET /api/admin/pts called with name='{}', phone='{}'", name, phone);
        List<AdminPtResponse> pts = adminPtService.getAllPts(name, phone);
        log.info("Returning {} PTs", pts.size());
        return pts;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminPtResponse> getPtDetail(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(adminPtService.getPtDetail(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePt(@PathVariable("id") Long id) {
        adminPtService.deletePtCompletely(id);
        return ResponseEntity.ok("Xóa Huấn luyện viên vĩnh viễn thành công");
    }

    @PutMapping("/{id}/downgrade")
    public ResponseEntity<String> downgradePt(@PathVariable(name = "id") Long id) {
        adminPtService.downgradeToMember(id);
        return ResponseEntity.ok("Hạ cấp Huấn luyện viên xuống Hội viên thành công");
    }

    @PostMapping
    public ResponseEntity<AdminPtResponse> createPt(@RequestBody AdminCreatePtRequest request) {
        log.info("API POST /api/admin/pts called with username='{}'", request.getUsername());
        AdminPtResponse response = adminPtService.createPt(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminPtResponse> updatePt(
            @PathVariable(name = "id") Long id,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) throws Exception {
        AdminUpdatePtRequest request = objectMapper.readValue(dataJson, AdminUpdatePtRequest.class);
        byte[] avatarBytes = avatar != null ? avatar.getBytes() : null;
        AdminPtResponse response = adminPtService.updatePt(id, request, avatarBytes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/positions")
    public List<Position> getAllPositions() {
        return positionRepository.findAll();
    }

    @GetMapping("/locations")
    public List<GymLocation> getAllLocations() {
        return gymLocationRepository.findAll();
    }
}
