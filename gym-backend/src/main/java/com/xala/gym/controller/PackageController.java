package com.xala.gym.controller;

import com.xala.gym.dto.response.PackageResponse;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageRepository packageRepository;

    @GetMapping
    public ResponseEntity<List<PackageResponse>> getActivePackages() {
        List<PackageResponse> activePackages = packageRepository.findAll().stream()
                .filter(Package::getActive)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activePackages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        return packageRepository.findById(id)
                .filter(Package::getActive)
                .map(pkg -> ResponseEntity.ok(this.mapToResponse(pkg)))
                .orElse(ResponseEntity.notFound().build());
    }

    private PackageResponse mapToResponse(Package pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .durationInDays(pkg.getDurationInDays())
                .category(pkg.getCategory())
                .maxSessions(pkg.getMaxSessions())
                .image(pkg.getImage())
                .promotion(pkg.getPromotion())
                .build();
    }
}
