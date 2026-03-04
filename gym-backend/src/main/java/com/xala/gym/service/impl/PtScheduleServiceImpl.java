package com.xala.gym.service.impl;

import com.xala.gym.dto.request.PtScheduleRequest;
import com.xala.gym.dto.response.PtScheduleResponse;
import com.xala.gym.entity.Booking;
import com.xala.gym.entity.Employee;
import com.xala.gym.entity.GymLocation;
import com.xala.gym.entity.User;
import com.xala.gym.repository.BookingRepository;
import com.xala.gym.repository.EmployeeRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.repository.MemberExerciseStatusRepository;
import com.xala.gym.service.PtScheduleService;
import com.xala.gym.service.NotificationService;
import com.xala.gym.dto.response.PtClientResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PtScheduleServiceImpl implements PtScheduleService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final MembershipCardRepository membershipCardRepository;
    private final MemberExerciseStatusRepository memberExerciseStatusRepository;

    @Override
    @Transactional
    public PtScheduleResponse addSlot(PtScheduleRequest request) {
        return createSlot(request, getCurrentUser());
    }

    @Override
    @Transactional
    public List<PtScheduleResponse> batchAdd(List<PtScheduleRequest> requests) {
        User pt = getCurrentUser();
        return requests.stream()
                .map(req -> createSlot(req, pt))
                .collect(Collectors.toList());
    }

    private PtScheduleResponse createSlot(PtScheduleRequest request, User pt) {
        // Kiểm tra trùng lịch
        List<Booking> overlaps = bookingRepository.findOverlappingSlots(
                pt.getId(), request.getStartTime(), request.getEndTime()
        );

        if (!overlaps.isEmpty()) {
            boolean hasBusy = overlaps.stream().anyMatch(o -> "BUSY".equals(o.getStatus()));
            if (hasBusy) {
                throw new IllegalArgumentException("Yêu cầu thất bại: Một hoặc nhiều khung giờ bị trùng với LỊCH BẬN CÁ NHÂN (BUSY) của PT.");
            }
            throw new IllegalArgumentException("Yêu cầu thất bại: Khung giờ bị trùng với lịch đã có của PT.");
        }

        Booking slot = new Booking();
        slot.setPersonalTrainer(pt);
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setStatus(request.getStatus() != null ? request.getStatus() : "AVAILABLE");

        // Đảm bảo các trường nullable
        slot.setMember(null);
        slot.setGymPackage(null);

        try {
            Booking saved = bookingRepository.save(slot);
            return mapToResponse(saved);
        } catch (Exception e) {
            System.err.println("[ERROR] Lỗi lưu lịch: " + e.getMessage());
            throw new RuntimeException("Lỗi cơ sở dữ liệu khi lưu lịch.");
        }
    }

    @Override
    public List<PtScheduleResponse> getMySchedule() {
        User pt = getCurrentUser();
        return bookingRepository.findByPersonalTrainerIdOrderByStartTimeAsc(pt.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PtScheduleResponse> getAvailableSlots(Long ptId) {
        return bookingRepository.findByPersonalTrainerIdOrderByStartTimeAsc(ptId)
                .stream()
                .filter(b -> "AVAILABLE".equals(b.getStatus()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PtScheduleResponse> getAdminSchedules(Integer branchId, String ptName, String status) {
        return bookingRepository.searchSchedules(branchId, ptName, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSlot(Long id) {
        Booking slot = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        User pt = getCurrentUser();
        if (!slot.getPersonalTrainer().getId().equals(pt.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa khung giờ này.");
        }

        if (slot.getMember() != null && !"CANCELLED".equals(slot.getStatus())) {
            throw new RuntimeException("Không thể xóa khung giờ đã có người đặt.");
        }

        bookingRepository.delete(slot);
    }

    @Override
    @Transactional
    public PtScheduleResponse adminUpdateSlot(Long id, PtScheduleRequest request) {
        Booking slot = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        if ("BUSY".equals(slot.getStatus())) {
            throw new IllegalArgumentException("Lịch bận cá nhân của PT không được phép chỉnh sửa từ phía Admin.");
        }

        // LUÔN kiểm tra trùng lịch đối với mọi cập nhật từ Admin
        List<Booking> overlaps = bookingRepository.findOverlappingSlots(
                slot.getPersonalTrainer().getId(), request.getStartTime(), request.getEndTime()
        );
        
        // Lọc bỏ chính slot hiện tại
        List<Booking> actualOverlaps = overlaps.stream()
                .filter(o -> !o.getId().equals(id))
                .collect(java.util.stream.Collectors.toList());

        if (!actualOverlaps.isEmpty()) {
            boolean hasBusy = actualOverlaps.stream().anyMatch(o -> "BUSY".equals(o.getStatus()));
            if (hasBusy) {
                throw new IllegalArgumentException("Không thể cập nhật: Thời gian này đã được PT đánh dấu là BẬN CÁ NHÂN (BUSY).");
            }
            throw new IllegalArgumentException("Khung giờ này bị trùng với một lịch dạy/lịch rảnh khác của PT.");
        }

        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        if (request.getStatus() != null) {
            slot.setStatus(request.getStatus());
        }
        if (request.getAdminNotes() != null) {
            slot.setAdminNotes(request.getAdminNotes());
        }

        // Kiểm tra sức chứa sau khi cập nhật (nếu là lịch đã có người đặt)
        if (slot.getMember() != null && (slot.getStatus().equals("CONFIRMED") || slot.getStatus().equals("PENDING"))) {
            Employee ptEmp = employeeRepository.findByUser_Id(slot.getPersonalTrainer().getId())
                    .orElse(null);
            if (ptEmp != null && ptEmp.getGymLocation() != null) {
                Integer maxCap = ptEmp.getGymLocation().getMaxCapacity();
                if (maxCap == null) maxCap = 3; // Giới hạn theo yêu cầu: 3 người
                long count = bookingRepository.countBookingsInBranchAtInterval(
                    ptEmp.getGymLocation().getId(), slot.getStartTime(), slot.getEndTime());
                if (count > maxCap) {
                    throw new RuntimeException("Cập nhật thất bại: Chi nhánh vượt quá sức chứa (" + maxCap + ").");
                }
            }
        }

        Booking saved = bookingRepository.save(slot);
        
        // Gửi thông báo thực cho PT
        String timeStr = slot.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM"));
        notificationService.sendNotification(
            slot.getPersonalTrainer().getId(),
            "Lịch tập lúc " + timeStr + " đã có cập nhật mới từ Admin.",
            "SCHEDULE_UPDATE"
        );

        // Gửi thông báo cho học viên (nếu có)
        if (slot.getMember() != null) {
            notificationService.sendNotification(
                slot.getMember().getId(),
                "Lịch tập của bạn lúc " + timeStr + " đã có cập nhật từ Admin. Vui lòng kiểm tra lại.",
                "SCHEDULE_UPDATE"
            );
        }
        
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void adminDeleteSlot(Long id) {
        Booking slot = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        if ("BUSY".equals(slot.getStatus())) {
            throw new IllegalArgumentException("Lịch bận cá nhân của PT không được phép xóa từ phía Admin.");
        }

        // Lấy thông tin trước khi xóa
        Long ptId = slot.getPersonalTrainer().getId();
        String timeStr = slot.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM"));

        bookingRepository.delete(slot);
        
        // Gửi thông báo thực cho PT
        notificationService.sendNotification(
            ptId,
            "Admin đã XÓA lịch tập của bạn vào lúc " + timeStr,
            "SCHEDULE_DELETE"
        );
    }

    @Override
    @Transactional
    public List<PtScheduleResponse> adminBatchAdd(Long ptId, List<PtScheduleRequest> requests) {
        User pt = userRepository.findById(ptId)
                .orElseThrow(() -> new RuntimeException("PT không tồn tại"));
        return requests.stream()
                .map(req -> createSlot(req, pt))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PtScheduleResponse bookSlot(Long slotId) {
        Booking slot = bookingRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        if (!"AVAILABLE".equals(slot.getStatus())) {
            throw new RuntimeException("Khung giờ này không khả dụng hoặc đã có người đặt.");
        }

        User member = getCurrentUser();
        Employee ptEmp = employeeRepository.findByUser_Id(slot.getPersonalTrainer().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu PT (không tìm thấy hồ sơ nhân viên)"));

        // Kiểm tra sức chứa chi nhánh
        if (ptEmp.getGymLocation() == null) {
            // Nếu PT chưa gán chi nhánh, có thể bỏ qua kiểm tra sức chứa hoặc báo lỗi
            // Ở đây ta báo lỗi để đảm bảo dữ liệu chuẩn
            throw new RuntimeException("PT này chưa được chỉ định chi nhánh làm việc. Vui lòng liên hệ Admin.");
        }

        Integer maxCap = ptEmp.getGymLocation().getMaxCapacity();
        if (maxCap == null) maxCap = 3; // Giới hạn theo yêu cầu: 3 người

        Integer branchId = ptEmp.getGymLocation().getId();
        long currentOccupancy = bookingRepository.countBookingsInBranchAtInterval(branchId, slot.getStartTime(), slot.getEndTime());

        if (currentOccupancy >= maxCap) {
            throw new RuntimeException("Chi nhánh này đã đạt giới hạn sức chứa " + maxCap + " người vào khung giờ này.");
        }

        slot.setMember(member);
        slot.setStatus("PENDING"); // Đợi Admin duyệt
        
        Booking saved = bookingRepository.save(slot);
        
        // Thông báo cho PT có yêu cầu mới
        notificationService.sendNotification(
            slot.getPersonalTrainer().getId(),
            "Học viên " + member.getFullName() + " đã yêu cầu đặt lịch vào lúc " + 
            slot.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
            "BOOKING_REQUEST"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void approveBooking(Long slotId) {
        Booking slot = bookingRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu không tồn tại"));
        
        // Kiểm tra sức chứa trước khi phê duyệt
        Employee ptEmp = employeeRepository.findByUser_Id(slot.getPersonalTrainer().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu PT"));
        
        if (ptEmp.getGymLocation() != null) {
            Integer maxCap = ptEmp.getGymLocation().getMaxCapacity();
            if (maxCap == null) maxCap = 3; // Giới hạn theo yêu cầu: 3 người
            
            long currentOccupancy = bookingRepository.countBookingsInBranchAtInterval(
                ptEmp.getGymLocation().getId(), slot.getStartTime(), slot.getEndTime());
            
            // Vì booking này đang là PENDING nên nó ĐÃ ĐƯỢC tính trong currentOccupancy.
            // Nếu currentOccupancy > maxCap thì nghĩa là đã vượt ngưỡng.
            if (currentOccupancy > maxCap) {
                throw new RuntimeException("Không thể phê duyệt vì chi nhánh đã đạt giới hạn sức chứa (" + maxCap + ") tại thời điểm này.");
            }
        }

        slot.setStatus("CONFIRMED");
        bookingRepository.save(slot);

        // Thông báo cho cả Member và PT
        notificationService.sendNotification(
            slot.getMember().getId(),
            "Lịch tập của bạn đã được Admin phê duyệt!",
            "BOOKING_APPROVED"
        );
        notificationService.sendNotification(
            slot.getPersonalTrainer().getId(),
            "Lịch dạy với học viên " + slot.getMember().getFullName() + " đã được xác nhận.",
            "BOOKING_CONFIRMED"
        );
    }

    @Override
    @Transactional
    public void rejectBooking(Long slotId) {
        Booking slot = bookingRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu không tồn tại"));
        
        User member = slot.getMember();
        slot.setMember(null);
        slot.setStatus("AVAILABLE"); // Trả lại trạng thái rảnh
        bookingRepository.save(slot);

        notificationService.sendNotification(
            member.getId(),
            "Yêu cầu đặt lịch của bạn đã bị từ chối. Vui lòng chọn khung giờ khác.",
            "BOOKING_REJECTED"
        );
    }

    @Override
    @Transactional
    public void cancelBookingByMember(Long slotId) {
        Booking slot = bookingRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Buổi tập không tồn tại"));

        User member = getCurrentUser();
        
        if (slot.getMember() == null || !slot.getMember().getId().equals(member.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên lịch tập này.");
        }

        if (!"PENDING".equals(slot.getStatus()) && !"CONFIRMED".equals(slot.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy lịch khi đang chờ duyệt hoặc đã xác nhận.");
        }

        // Kiểm tra quy tắc 24h
        java.time.Duration timeUntilStart = java.time.Duration.between(LocalDateTime.now(), slot.getStartTime());
        if (timeUntilStart.toHours() < 24) {
            throw new RuntimeException("Không thể hủy! Chỉ được phép hủy lịch trước thời gian bắt đầu ít nhất 24 giờ. Vui lòng liên hệ Admin.");
        }

        slot.setStatus("CANCELLED");
        bookingRepository.save(slot);

        // Thông báo cho PT
        String timeStr = slot.getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM"));
        notificationService.sendNotification(
            slot.getPersonalTrainer().getId(),
            "Học viên " + member.getFullName() + " đã HỦY lịch tập lúc " + timeStr + ".",
            "BOOKING_CANCELLED"
        );
    }

    @Override
    @Transactional
    public PtScheduleResponse saveSessionContent(Long slotId, com.xala.gym.dto.request.WorkoutSessionContentRequest request) {
        Booking slot = bookingRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        User pt = getCurrentUser();
        if (!slot.getPersonalTrainer().getId().equals(pt.getId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật phiên tập này.");
        }

        if (!"COMPLETED".equals(slot.getStatus()) && !"CONFIRMED".equals(slot.getStatus())) {
            throw new RuntimeException("Chỉ có thể nhập nội dung cho phiên tập đã xác nhận hoặc hoàn thành.");
        }

        slot.setExercises(request.getExercises());
        slot.setAchievedGoals(request.getAchievedGoals());
        slot.setPtEvaluation(request.getPtEvaluation());
        
        // Auto mark as COMPLETED if it's CONFIRMED
        if ("CONFIRMED".equals(slot.getStatus())) {
            slot.setStatus("COMPLETED");
        }

        Booking saved = bookingRepository.save(slot);

        // Gửi thông báo cho học viên khi PT cập nhật đánh giá buổi tập
        notificationService.sendNotification(
            slot.getMember().getId(),
            "PT " + pt.getFullName() + " đã cập nhật kết quả và đánh giá buổi tập của bạn. Nhấn vào để xem chi tiết.",
            "WORKOUT_EVALUATED"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void markSessionAsCompleted(Long slotId) {
        Booking slot = bookingRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        User pt = getCurrentUser();
        if (!slot.getPersonalTrainer().getId().equals(pt.getId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật phiên tập này.");
        }

        if (!"CONFIRMED".equals(slot.getStatus())) {
            throw new RuntimeException("Chỉ có thể đánh dấu hoàn thành cho buổi tập đã được xác nhận (CONFIRMED).");
        }

        slot.setStatus("COMPLETED");
        bookingRepository.save(slot);

        // Gửi thông báo cho học viên
        notificationService.sendNotification(
            slot.getMember().getId(),
            "PT " + pt.getFullName() + " đã xác nhận bạn hoàn thành buổi tập. Chúc mừng bạn đã nỗ lực!",
            "WORKOUT_COMPLETED"
        );
    }

    @Override
    public List<PtScheduleResponse> getPendingBookings() {
        return bookingRepository.findByStatusOrderByStartTimeDesc("PENDING")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PtScheduleResponse> getMemberBookings() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByMemberIdOrderByStartTimeDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PtClientResponse> getMyClients() {
        User pt = getCurrentUser();
        
        // Find existing distinct members that this PT has booked sessions with
        List<com.xala.gym.entity.Member> distinctMembers = bookingRepository.findDistinctMembersByPtId(pt.getId());

        return distinctMembers.stream().map(member -> {
            
            // Look up the active gym package
            String activePackageName = "Chưa đăng ký gói tập";
            java.time.LocalDate packageEndDate = null;

            // We depend on membershipCardRepository here
            java.util.Optional<com.xala.gym.entity.MembershipCard> activeCardOpt = 
                membershipCardRepository.findFirstByMemberIdAndStatusOrderByEndDateDesc(member.getId(), "ACTIVE");
            
            if (activeCardOpt.isPresent() && activeCardOpt.get().getGymPackage() != null) {
                activePackageName = activeCardOpt.get().getGymPackage().getName();
                packageEndDate = activeCardOpt.get().getEndDate();
            }

            return PtClientResponse.builder()
                .memberId(member.getId())
                .memberName(member.getName() != null ? member.getName() : "Khách hàng")
                .email(member.getEmail())
                .phone(member.getPhone())
                .height(member.getHeight())
                .weight(member.getWeight())
                .bmi(member.getBmi())
                .goalType(member.getGoalType() != null ? member.getGoalType().name() : null)
                .activePackageName(activePackageName)
                .packageEndDate(packageEndDate)
                .build();
        }).collect(Collectors.toList());
    }

    @Override
    public PtScheduleResponse getScheduleById(Long id) {
        Booking slot = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        User currentUser = getCurrentUser();
        // Check permissions: only the assigned PT or the booked member can view details (or Admin)
        boolean isMember = slot.getMember() != null && slot.getMember().getId().equals(currentUser.getId());
        boolean isPT = slot.getPersonalTrainer().getId().equals(currentUser.getId());
        
        // You might want to allow Admins too if needed. Here we allow the member or the PT.
        if (!isMember && !isPT) {
             throw new RuntimeException("Bạn không có quyền xem chi tiết buổi tập này.");
        }

        return mapToResponse(slot);
    }

    @Override
    public List<PtScheduleResponse> getMemberTrainingHistory(Long memberId) {
        User pt = getCurrentUser();
        return bookingRepository.findByMemberIdAndPersonalTrainerIdOrderByStartTimeDesc(memberId, pt.getId())
                .stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()) || (b.getStartTime().isBefore(LocalDateTime.now()) && !"CANCELLED".equals(b.getStatus())))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<com.xala.gym.dto.response.MemberExerciseProgressResponse> getMemberExerciseProgress(Long memberId) {
        User pt = getCurrentUser();
        // Return exercise progress for the member.
        return memberExerciseStatusRepository.findByMembershipCard_Member_IdOrderByCompletedAtDesc(memberId)
                .stream()
                .map(status -> com.xala.gym.dto.response.MemberExerciseProgressResponse.builder()
                        .id(status.getId())
                        .exerciseName(status.getExercise().getName())
                        .description(status.getExercise().getDescription())
                        .sets(status.getExercise().getSets())
                        .reps(status.getExercise().getReps())
                        .isCompleted(status.getIsCompleted())
                        .completedAt(status.getCompletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public long getMonthlyCompletedSessionsCount() {
        User pt = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        return bookingRepository.countCompletedSessionsByPtIdAndMonthAndYear(pt.getId(), now.getMonthValue(), now.getYear());
    }

    @Override
    public long getManagedClientsCount() {
        User pt = getCurrentUser();
        return bookingRepository.findDistinctMembersByPtId(pt.getId()).size();
    }

    @Override
    public List<PtScheduleResponse> getUpcomingSchedules(int limit) {
        User pt = getCurrentUser();
        List<Booking> upcoming = bookingRepository.findUpcomingSchedulesByPtId(pt.getId(), LocalDateTime.now());
        return upcoming.stream()
                .limit(limit)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public com.xala.gym.dto.response.WeeklyStatsResponse getMemberWeeklyStats() {
        User member = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        // Lấy thứ Hai của tuần này
        LocalDateTime startOfWeek = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                                       .withHour(0).withMinute(0).withSecond(0).withNano(0);
        // Lấy Chủ nhật của tuần này
        LocalDateTime endOfWeek = now.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY))
                                     .withHour(23).withMinute(59).withSecond(59).withNano(999000000);

        List<Booking> weeklyBookings = bookingRepository.findByMemberIdOrderByStartTimeDesc(member.getId()).stream()
                .filter(b -> !b.getStartTime().isBefore(startOfWeek) && !b.getStartTime().isAfter(endOfWeek))
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .collect(Collectors.toList());

        int totalMinutesThisWeek = 0;
        
        // Khởi tạo List 7 ngày: T2, T3, T4, T5, T6, T7, CN
        String[] dayNames = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};
        List<com.xala.gym.dto.response.WeeklyStatsResponse.DailyStat> dailyStats = new java.util.ArrayList<>();
        
        for (int i = 0; i < 7; i++) {
            LocalDateTime day = startOfWeek.plusDays(i);
            String dateStr = day.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM"));
            dailyStats.add(new com.xala.gym.dto.response.WeeklyStatsResponse.DailyStat(dayNames[i], 0, dateStr));
        }

        for (Booking b : weeklyBookings) {
            long durationMinutes = java.time.Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
            totalMinutesThisWeek += durationMinutes;
            
            // Tìm index của ngày trong tuần (MONDAY = 1 -> index 0)
            int index = b.getStartTime().getDayOfWeek().getValue() - 1;
            if (index >= 0 && index < 7) {
                int currentMins = dailyStats.get(index).getMinutes();
                dailyStats.get(index).setMinutes(currentMins + (int)durationMinutes);
            }
        }

        return com.xala.gym.dto.response.WeeklyStatsResponse.builder()
                .totalMinutes(totalMinutesThisWeek)
                .dailyStats(dailyStats)
                .build();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private PtScheduleResponse mapToResponse(Booking b) {
        User pt = b.getPersonalTrainer();
        Employee emp = employeeRepository.findByUser_Id(pt.getId()).orElse(null);
        
        return PtScheduleResponse.builder()
                .id(b.getId())
                .ptId(pt.getId())
                .ptName(pt.getFullName())
                .branchName(emp != null && emp.getGymLocation() != null ? emp.getGymLocation().getName() : "N/A")
                .memberId(b.getMember() != null ? b.getMember().getId() : null)
                .memberName(b.getMember() != null ? b.getMember().getFullName() : null)
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .ptPhone(emp != null ? emp.getPhone() : "N/A")
                .ptSpecialty(emp != null ? emp.getPtSpecialty() : "General")
                .adminNotes(b.getAdminNotes())
                .exercises(b.getExercises())
                .achievedGoals(b.getAchievedGoals())
                .ptEvaluation(b.getPtEvaluation())
                .build();
    }
}
