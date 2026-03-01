package com.xala.gym.service.impl;

import com.xala.gym.dto.request.WorkoutExerciseRequest;
import com.xala.gym.dto.request.WorkoutPlanRequest;
import com.xala.gym.dto.response.WorkoutExerciseResponse;
import com.xala.gym.dto.response.WorkoutPlanResponse;
import com.xala.gym.entity.*;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.*;
import com.xala.gym.service.WorkoutPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutPlanServiceImpl implements WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final PackageRepository packageRepository;
    private final MembershipCardRepository membershipCardRepository;
    private final MemberExerciseStatusRepository memberExerciseStatusRepository;
    private final UserRepository userRepository;

    @Override
    public WorkoutPlanResponse getWorkoutPlanByPackageId(Long packageId) {
        WorkoutPlan plan = workoutPlanRepository.findByGymPackage_Id(packageId).orElse(null);
        if (plan == null) return null;
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public WorkoutPlanResponse saveWorkoutPlan(Long packageId, WorkoutPlanRequest request) {
        Package gymPackage = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        WorkoutPlan plan = workoutPlanRepository.findByGymPackage_Id(packageId)
                .orElse(WorkoutPlan.builder()
                        .gymPackage(gymPackage)
                        .exercises(new ArrayList<>())
                        .build());

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        WorkoutPlan savedPlan = workoutPlanRepository.save(plan);

        // Handle exercises (Clear and rebuild for simplicity in this version)
        // In a production app, we might want to sync instead of clear
        savedPlan.getExercises().clear();
        if (request.getExercises() != null) {
            for (WorkoutExerciseRequest exReq : request.getExercises()) {
                WorkoutExercise exercise = WorkoutExercise.builder()
                        .workoutPlan(savedPlan)
                        .name(exReq.getName())
                        .description(exReq.getDescription())
                        .sets(exReq.getSets())
                        .reps(exReq.getReps())
                        .orderIndex(exReq.getOrderIndex())
                        .build();
                savedPlan.getExercises().add(exercise);
            }
        }
        
        return mapToResponse(workoutPlanRepository.save(savedPlan));
    }

    @Override
    public WorkoutPlanResponse getMemberActiveRoadmap() {
        User user = getCurrentUser();
        // Assuming a member can have only one ACTIVE membership card at a time for simplicity
        MembershipCard activeCard = membershipCardRepository.findByMember_User_Id(user.getId())
                .stream()
                .filter(c -> "ACTIVE".equals(c.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active membership found"));

        WorkoutPlan plan = workoutPlanRepository.findByGymPackage_Id(activeCard.getGymPackage().getId())
                .orElseThrow(() -> new RuntimeException("No workout roadmap for this package"));

        WorkoutPlanResponse response = mapToResponse(plan);
        
        // Map completion status
        List<MemberExerciseStatus> statuses = memberExerciseStatusRepository.findByMembershipCard_Id(activeCard.getId());
        for (WorkoutExerciseResponse exRes : response.getExercises()) {
            boolean completed = statuses.stream()
                    .anyMatch(s -> s.getExercise().getId().equals(exRes.getId()) && s.getIsCompleted());
            exRes.setIsCompleted(completed);
        }
        
        return response;
    }

    @Override
    @Transactional
    public void toggleExerciseCompletion(Long exerciseId) {
        User user = getCurrentUser();
        MembershipCard activeCard = membershipCardRepository.findByMember_User_Id(user.getId())
                .stream()
                .filter(c -> "ACTIVE".equals(c.getStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active membership found"));

        WorkoutExercise exercise = workoutExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        MemberExerciseStatus status = memberExerciseStatusRepository
                .findByMembershipCard_IdAndExercise_Id(activeCard.getId(), exerciseId)
                .orElse(MemberExerciseStatus.builder()
                        .membershipCard(activeCard)
                        .exercise(exercise)
                        .isCompleted(false)
                        .build());

        status.setIsCompleted(!status.getIsCompleted());
        if (status.getIsCompleted()) {
            status.setCompletedAt(LocalDateTime.now());
        } else {
            status.setCompletedAt(null);
        }
        
        memberExerciseStatusRepository.save(status);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private WorkoutPlanResponse mapToResponse(WorkoutPlan plan) {
        return WorkoutPlanResponse.builder()
                .id(plan.getId())
                .packageId(plan.getGymPackage().getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .exercises(plan.getExercises().stream()
                        .map(e -> WorkoutExerciseResponse.builder()
                                .id(e.getId())
                                .name(e.getName())
                                .description(e.getDescription())
                                .sets(e.getSets())
                                .reps(e.getReps())
                                .orderIndex(e.getOrderIndex())
                                .isCompleted(false)
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
