package com.xala.gym.controller;

import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.dto.response.PackageResponse;
import com.xala.gym.dto.response.WorkoutRoadmapResponse;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.repository.WorkoutRoadmapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageController {

    private final PackageRepository packageRepository;
    private final WorkoutRoadmapRepository roadmapRepository;

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
        System.out.println("Fetching package with ID: " + id);
        return packageRepository.findById(id)
                .filter(Package::getActive)
                .map(pkg -> {
                    PackageResponse response = this.mapToResponse(pkg);
                    System.out.println("Roadmaps found for " + id + ": " + (response.getRoadmaps() != null ? response.getRoadmaps().size() : 0));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/debug/roadmaps")
    public ResponseEntity<List<WorkoutRoadmapResponse>> debugAllRoadmaps() {
        return ResponseEntity.ok(roadmapRepository.findAll().stream()
                .map(rm -> WorkoutRoadmapResponse.builder()
                        .id(rm.getId())
                        .name(rm.getName())
                        .orderIndex(rm.getOrderIndex())
                        .build())
                .collect(Collectors.toList()));
    }

    private PackageResponse mapToResponse(Package pkg) {
        // Map PTs
        List<AdminPtResponse> ptResponses = pkg.getPersonalTrainers().stream()
                .map(pt -> AdminPtResponse.builder()
                        .id(pt.getId())
                        .name(pt.getName())
                        .ptSpecialty(pt.getPtSpecialty())
                        .ptExperience(pt.getPtExperience())
                        .ptBio(pt.getPtBio())
                        .ptRating(pt.getPtRating())
                        .avatar(pt.getAvatar() != null ? Base64.getEncoder().encodeToString(pt.getAvatar()) : null)
                        .build())
                .collect(Collectors.toList());

        // Map Roadmaps
        List<WorkoutRoadmapResponse> roadmapResponses = roadmapRepository.findByGymPackageIdOrderByOrderIndexAsc(pkg.getId()).stream()
                .map(rm -> WorkoutRoadmapResponse.builder()
                        .id(rm.getId())
                        .name(rm.getName())
                        .description(rm.getDescription())
                        .orderIndex(rm.getOrderIndex())
                        .sessionCount(rm.getSessions() != null ? rm.getSessions().size() : 0)
                        .build())
                .collect(Collectors.toList());

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
                .personalTrainers(ptResponses)
                .roadmaps(roadmapResponses)
                .build();
    }
}
