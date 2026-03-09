package com.xala.gym.service.impl;

import com.xala.gym.dto.response.*;
import com.xala.gym.entity.*;
import com.xala.gym.repository.*;
import com.xala.gym.service.MemberProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberProgressServiceImpl implements MemberProgressService {

    private final MemberExerciseStatusRepository statusRepository;
    private final WorkoutRoadmapRepository roadmapRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final SessionExerciseRepository sessionExerciseRepository;
    private final MembershipCardRepository membershipCardRepository;

    @Override
    public MemberProgressResponse getMemberProgress(Long membershipCardId) {
        MembershipCard card = membershipCardRepository.findById(membershipCardId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Membership Card: " + membershipCardId));

        Long packageId = card.getGymPackage().getId();

        // 1. Lấy tất cả roadmap của package
        List<WorkoutRoadmap> roadmaps = roadmapRepository.findByGymPackageIdOrderByOrderIndexAsc(packageId);

        // 2. Lấy tất cả status của member
        List<MemberExerciseStatus> statuses = statusRepository.findByMembershipCard_Id(membershipCardId);
        Map<Long, MemberExerciseStatus> statusMap = statuses.stream()
                .collect(Collectors.toMap(s -> s.getSessionExercise().getId(), s -> s));

        List<RoadmapProgress> roadmapProgressList = new ArrayList<>();
        Map<String, int[]> categoryStats = new HashMap<>(); // key: categoryName, value: [completed, total]

        int totalGlobalExercises = 0;
        int completedGlobalExercises = 0;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (WorkoutRoadmap roadmap : roadmaps) {
            List<WorkoutSession> sessions = sessionRepository.findByRoadmapIdOrderByOrderIndexAsc(roadmap.getId());
            List<SessionProgress> sessionProgressList = new ArrayList<>();

            int totalRoadmapExercises = 0;
            int completedRoadmapExercises = 0;

            for (WorkoutSession session : sessions) {
                List<SessionExercise> sessionExercises = sessionExerciseRepository.findBySessionIdOrderByOrderIndexAsc(session.getId());
                List<ExerciseProgressDto> exerciseProgressDtos = new ArrayList<>();

                int totalSessionExercises = sessionExercises.size();
                int completedSessionExercises = 0;

                for (SessionExercise se : sessionExercises) {
                    MemberExerciseStatus status = statusMap.get(se.getId());
                    boolean isCompleted = (status != null && status.getIsCompleted());
                    String completedAt = (isCompleted && status.getCompletedAt() != null) 
                            ? status.getCompletedAt().format(formatter) : null;

                    if (isCompleted) {
                        completedSessionExercises++;
                        completedRoadmapExercises++;
                        completedGlobalExercises++;
                    }

                    // Thống kê Category - Thêm null-safe check
                    String categoryName = "Chung";
                    if (se.getExerciseLevel() != null && 
                        se.getExerciseLevel().getStandardExercise() != null && 
                        se.getExerciseLevel().getStandardExercise().getCategory() != null) {
                        categoryName = se.getExerciseLevel().getStandardExercise().getCategory().getName();
                    }
                    
                    categoryStats.putIfAbsent(categoryName, new int[]{0, 0});
                    categoryStats.get(categoryName)[1]++; // total
                    if (isCompleted) categoryStats.get(categoryName)[0]++; // completed

                    String exName = (se.getExerciseLevel() != null && se.getExerciseLevel().getStandardExercise() != null)
                            ? se.getExerciseLevel().getStandardExercise().getName() : "Bài tập không tên";

                    exerciseProgressDtos.add(ExerciseProgressDto.builder()
                            .sessionExerciseId(se.getId())
                            .exerciseName(exName)
                            .categoryName(categoryName)
                            .levelName(se.getExerciseLevel() != null ? se.getExerciseLevel().getLevelName() : "N/A")
                            .sets(se.getExerciseLevel() != null ? se.getExerciseLevel().getSets() : 0)
                            .reps(se.getExerciseLevel() != null ? se.getExerciseLevel().getReps() : 0)
                            .isCompleted(isCompleted)
                            .completedAt(completedAt)
                            .build());
                }

                totalRoadmapExercises += totalSessionExercises;
                totalGlobalExercises += totalSessionExercises;

                double sessionPct = totalSessionExercises == 0 ? 0.0 : ((double) completedSessionExercises / totalSessionExercises) * 100.0;

                sessionProgressList.add(SessionProgress.builder()
                        .sessionId(session.getId())
                        .name(session.getName())
                        .completedExercises(completedSessionExercises)
                        .totalExercises(totalSessionExercises)
                        .percentage(Math.round(sessionPct * 10.0) / 10.0)
                        .exercises(exerciseProgressDtos)
                        .build());
            }

            double roadmapPct = totalRoadmapExercises == 0 ? 0.0 : ((double) completedRoadmapExercises / totalRoadmapExercises) * 100.0;

            roadmapProgressList.add(RoadmapProgress.builder()
                    .roadmapId(roadmap.getId())
                    .name(roadmap.getName())
                    .completedExercises(completedRoadmapExercises)
                    .totalExercises(totalRoadmapExercises)
                    .percentage(Math.round(roadmapPct * 10.0) / 10.0)
                    .sessionProgresses(sessionProgressList)
                    .build());
        }

        // Tạo Category Progress List
        List<CategoryProgress> categoryProgressList = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : categoryStats.entrySet()) {
            int completed = entry.getValue()[0];
            int total = entry.getValue()[1];
            double catPct = total == 0 ? 0.0 : ((double) completed / total) * 100.0;

            categoryProgressList.add(CategoryProgress.builder()
                    .categoryName(entry.getKey())
                    .completedExercises(completed)
                    .totalExercises(total)
                    .percentage(Math.round(catPct * 10.0) / 10.0)
                    .build());
        }

        double globalPct = totalGlobalExercises == 0 ? 0.0 : ((double) completedGlobalExercises / totalGlobalExercises) * 100.0;

        return MemberProgressResponse.builder()
                .overallPercentage(Math.round(globalPct * 10.0) / 10.0)
                .totalCompletedExercises(completedGlobalExercises)
                .totalExercises(totalGlobalExercises)
                .roadmaps(roadmapProgressList)
                .categories(categoryProgressList)
                .build();
    }

    @Override
    public void toggleExerciseStatus(Long membershipCardId, Long sessionExerciseId) {
        MembershipCard card = membershipCardRepository.findById(membershipCardId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Membership Card"));

        SessionExercise sessionExercise = sessionExerciseRepository.findById(sessionExerciseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập: " + sessionExerciseId));

        MemberExerciseStatus status = statusRepository.findByMembershipCard_IdAndSessionExercise_Id(membershipCardId, sessionExerciseId)
                .orElse(MemberExerciseStatus.builder()
                        .membershipCard(card)
                        .sessionExercise(sessionExercise)
                        .isCompleted(false)
                        .build());

        // Toggle state
        boolean newState = !status.getIsCompleted();
        status.setIsCompleted(newState);
        status.setCompletedAt(newState ? LocalDateTime.now() : null);

        statusRepository.save(status);
    }
}
