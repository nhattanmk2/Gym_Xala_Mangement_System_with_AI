package com.xala.gym.controller;

import com.xala.gym.entity.*;
import com.xala.gym.entity.Package;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;
    private final PackageRepository packageRepository;
    private final MembershipCardRepository membershipCardRepository;
    private final EmployeeRepository employeeRepository;
    private final BookingRepository bookingRepository;
    private final WorkoutRoadmapRepository roadmapRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final com.xala.gym.service.PtScheduleService ptScheduleService;

    @PostMapping("/sync-progress")
    public ResponseEntity<String> syncProgress() {
        // 1. Đồng bộ lại số buổi tập còn lại (remainingSessions)
        List<MembershipCard> allCards = membershipCardRepository.findAll();
        for (MembershipCard card : allCards) {
            if (card.getRemainingSessions() == null && card.getGymPackage() != null && card.getGymPackage().getMaxSessions() != null) {
                // Đếm số buổi đã được đặt (PENDING, CONFIRMED, COMPLETED)
                long usedSessions = bookingRepository.countByMember_IdAndGymPackage_IdAndStatusIn(
                        card.getMember().getUser().getId(),
                        card.getGymPackage().getId(),
                        Arrays.asList("PENDING", "CONFIRMED", "COMPLETED")
                );
                
                int remaining = card.getGymPackage().getMaxSessions() - (int)usedSessions;
                card.setRemainingSessions(Math.max(0, remaining));
                membershipCardRepository.save(card);
            }
        }

        // 2. Chạy lại logic tính tiến độ lộ trình cho tất cả các buổi tập đã hoàn thành
        List<Booking> completedBookings = bookingRepository.findByStatusOrderByStartTimeDesc("COMPLETED");
        for (Booking b : completedBookings) {
            if (b.getMember() != null && b.getGymPackage() != null) {
                try {
                    ptScheduleService.updateMemberExerciseProgress(b.getMember(), b.getGymPackage());
                } catch (Exception e) {
                    System.err.println("Lỗi khi sync progress cho booking: " + b.getId());
                }
            }
        }

        return ResponseEntity.ok("Successfully synced remaining sessions and progress for completed bookings.");
    }

    @PostMapping("/students")
    public ResponseEntity<String> seedStudents() {
        Role memberRole = roleRepository.findByName(UserRole.ROLE_MEMBER)
                .orElseThrow(() -> new RuntimeException("ROLE_MEMBER not found"));

        Package gymPackage = packageRepository.findAll().stream()
                .filter(p -> p.getMaxSessions() != null && p.getMaxSessions() > 0)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No suitable gym package found for seeding"));

        // PT "nhattan" or any first PT
        Employee pt = employeeRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No PT found for seeding"));

        String[] names = {"Nguyễn Văn A", "Trần Thị B", "Lê Văn C"};
        String[] usernames = {"student_a", "student_b", "student_c"};

        for (int i = 0; i < 3; i++) {
            if (userRepository.findByUsername(usernames[i]).isPresent()) continue;

            User user = new User();
            user.setUsername(usernames[i]);
            user.setPassword(passwordEncoder.encode("123456"));
            user.setEmail(usernames[i] + "@example.com");
            user.setFullName(names[i]);
            user.setPhone("090000000" + i);
            user.setEnabled(true);
            user.getRoles().add(memberRole);
            User savedUser = userRepository.save(user);

            Member member = Member.builder()
                    .user(savedUser)
                    .name(savedUser.getFullName())
                    .email(savedUser.getEmail())
                    .phone(savedUser.getPhone())
                    .status(true)
                    .build();
            memberRepository.save(member);

            MembershipCard card = MembershipCard.builder()
                    .member(member)
                    .gymPackage(gymPackage)
                    .assignedPt(pt)
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(1))
                    .status("ACTIVE")
                    .remainingSessions(gymPackage.getMaxSessions())
                    .build();
            membershipCardRepository.save(card);

            // Create some bookings for today
            LocalDateTime start = LocalDateTime.now().withHour(18).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime end = start.plusHours(1);

            Booking booking = new Booking();
            booking.setMember(savedUser);
            booking.setPersonalTrainer(pt.getUser());
            booking.setGymPackage(gymPackage);
            booking.setStartTime(start);
            booking.setEndTime(end);
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);
        }

        // ======= Thêm dữ liệu Lộ trình (Roadmap) mẫu =======
        if (roadmapRepository.findByGymPackageId(gymPackage.getId()).isEmpty()) {
            WorkoutRoadmap roadmap = WorkoutRoadmap.builder()
                    .gymPackage(gymPackage)
                    .name("Lộ trình " + gymPackage.getName())
                    .description("Lộ trình tập luyện cơ bản cho người mới")
                    .orderIndex(1)
                    .build();
            roadmapRepository.save(roadmap);

            WorkoutSession session = WorkoutSession.builder()
                    .roadmap(roadmap)
                    .name("Buổi 1: Toàn thân")
                    .orderIndex(1)
                    .build();
            sessionRepository.save(session);
            
            // Dummy StandardExercise and ExerciseLevel if possible, but we don't have them easily here 
            // without fetching or creating them. We'll leave the session without exercises or
            // just an empty session to at least show the roadmap title in the UI.
        }
        // ====================================================

        return ResponseEntity.ok("Successfully seeded 3 students, their schedules, and a sample roadmap.");
    }
}
