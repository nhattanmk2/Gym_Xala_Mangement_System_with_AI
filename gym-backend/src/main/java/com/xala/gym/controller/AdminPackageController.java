package com.xala.gym.controller;

import com.xala.gym.dto.request.PackageRequest;
import com.xala.gym.entity.Package;
import com.xala.gym.service.AdminPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
public class AdminPackageController {

    private final AdminPackageService adminPackageService;

    @GetMapping
    public ResponseEntity<List<Package>> getAllPackages() {
        return ResponseEntity.ok(adminPackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Package> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(adminPackageService.getPackageById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Package> createPackage(
            @RequestPart("data") @Valid PackageRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(adminPackageService.createPackage(request, image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Package> updatePackage(
            @PathVariable Long id,
            @RequestPart("data") @Valid PackageRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(adminPackageService.updatePackage(id, request, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        adminPackageService.deletePackage(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Package> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(adminPackageService.toggleActive(id));
    }

    @PatchMapping("/{id}/promotion")
    public ResponseEntity<Package> updatePromotion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminPackageService.updatePromotion(id, body.get("promotion")));
    }
}
