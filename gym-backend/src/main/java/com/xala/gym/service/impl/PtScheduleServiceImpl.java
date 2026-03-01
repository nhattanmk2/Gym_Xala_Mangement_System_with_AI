package com.xala.gym.service.impl;

import com.xala.gym.dto.request.PtScheduleRequest;
import com.xala.gym.dto.response.PtScheduleResponse;
import com.xala.gym.entity.Booking;
import com.xala.gym.entity.User;
import com.xala.gym.repository.BookingRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.service.PtScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PtScheduleServiceImpl implements PtScheduleService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

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
            throw new RuntimeException("Khung giờ " + request.getStartTime() + " bị trùng với lịch đã có.");
        }

        Booking slot = new Booking();
        slot.setPersonalTrainer(pt);
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setStatus("AVAILABLE");

        // Đảm bảo các trường nullable không gây lỗi nếu DB cũ vẫn còn ràng buộc
        slot.setMember(null);
        slot.setGymPackage(null);

        Booking saved = bookingRepository.save(slot);
        return mapToResponse(saved);
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

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private PtScheduleResponse mapToResponse(Booking b) {
        return PtScheduleResponse.builder()
                .id(b.getId())
                .memberId(b.getMember() != null ? b.getMember().getId() : null)
                .memberName(b.getMember() != null ? b.getMember().getFullName() : null)
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .build();
    }
}
