package com.xala.gym.service.impl;

import com.xala.gym.dto.request.*;
import com.xala.gym.entity.*;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.*;
import com.xala.gym.service.AdminPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPackageServiceImpl implements AdminPackageService {

    private final PackageRepository packageRepository;
    private final WorkoutRoadmapRepository roadmapRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final SessionExerciseRepository sessionExerciseRepository;
    private final ExerciseLevelRepository levelRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    @Override
    public Package getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    @Override
    @Transactional
    public Package createPackage(PackageRequest request, MultipartFile image) throws IOException {
        Package pkg = new Package();
        mapRequestToEntity(request, pkg);
        if (image != null && !image.isEmpty()) {
            pkg.setImage(image.getBytes());
        }
        Package savedPkg = packageRepository.save(pkg);
        
        if (request.getRoadmaps() != null) {
            saveRoadmaps(savedPkg, request.getRoadmaps());
        }
        
        return savedPkg;
    }

    @Override
    @Transactional
    public Package updatePackage(Long id, PackageRequest request, MultipartFile image) throws IOException {
        Package pkg = getPackageById(id);
        mapRequestToEntity(request, pkg);
        if (image != null && !image.isEmpty()) {
            pkg.setImage(image.getBytes());
        }
        
        // Clear existing roadmaps for full update (simplification)
        List<WorkoutRoadmap> oldRoadmaps = roadmapRepository.findByGymPackageId(id);
        roadmapRepository.deleteAll(oldRoadmaps);
        
        Package savedPkg = packageRepository.save(pkg);
        
        if (request.getRoadmaps() != null) {
            saveRoadmaps(savedPkg, request.getRoadmaps());
        }
        
        return savedPkg;
    }

    private void saveRoadmaps(Package pkg, List<WorkoutRoadmapRequest> roadmapRequests) {
        for (WorkoutRoadmapRequest rr : roadmapRequests) {
            WorkoutRoadmap roadmap = WorkoutRoadmap.builder()
                    .gymPackage(pkg)
                    .name(rr.getName())
                    .description(rr.getDescription())
                    .orderIndex(rr.getOrderIndex())
                    .build();
            WorkoutRoadmap savedRm = roadmapRepository.save(roadmap);

            if (rr.getSessions() != null) {
                for (WorkoutSessionRequest sr : rr.getSessions()) {
                    WorkoutSession session = WorkoutSession.builder()
                            .roadmap(savedRm)
                            .name(sr.getName())
                            .orderIndex(sr.getOrderIndex())
                            .build();
                    WorkoutSession savedSess = sessionRepository.save(session);

                    if (sr.getExercises() != null) {
                        for (SessionExerciseRequest er : sr.getExercises()) {
                            ExerciseLevel level = levelRepository.findById(er.getExerciseLevelId()).orElse(null);
                            if (level != null) {
                                SessionExercise se = SessionExercise.builder()
                                        .session(savedSess)
                                        .exerciseLevel(level)
                                        .orderIndex(er.getOrderIndex())
                                        .build();
                                sessionExerciseRepository.save(se);
                            }
                        }
                    }
                }
            }
        }
    }

    @Override
    @Transactional
    public void deletePackage(Long id) {
        List<WorkoutRoadmap> oldRoadmaps = roadmapRepository.findByGymPackageId(id);
        roadmapRepository.deleteAll(oldRoadmaps);
        
        Package pkg = getPackageById(id);
        packageRepository.delete(pkg);
    }

    @Override
    @Transactional
    public Package toggleActive(Long id) {
        Package pkg = getPackageById(id);
        pkg.setActive(!pkg.getActive());
        return packageRepository.save(pkg);
    }

    @Override
    @Transactional
    public Package updatePromotion(Long id, String promotion) {
        Package pkg = getPackageById(id);
        pkg.setPromotion(promotion);
        return packageRepository.save(pkg);
    }

    private void mapRequestToEntity(PackageRequest request, Package pkg) {
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationInDays(request.getDurationInDays());
        pkg.setCategory(request.getCategory());
        pkg.setMaxSessions(request.getMaxSessions());
        pkg.setPromotion(request.getPromotion());
        if (request.getActive() != null) {
            pkg.setActive(request.getActive());
        }

        if (request.getPtIds() != null && !request.getPtIds().isEmpty()) {
            java.util.Set<Employee> pts = new java.util.HashSet<>(employeeRepository.findAllById(request.getPtIds()));
            pkg.setPersonalTrainers(pts);
        } else {
            if (pkg.getPersonalTrainers() != null) {
                pkg.getPersonalTrainers().clear();
            } else {
                pkg.setPersonalTrainers(new java.util.HashSet<>());
            }
        }
    }
}
