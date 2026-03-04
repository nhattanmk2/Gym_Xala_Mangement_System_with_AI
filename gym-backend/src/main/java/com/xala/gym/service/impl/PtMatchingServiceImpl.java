package com.xala.gym.service.impl;

import com.xala.gym.dto.request.PtMatchingRequest;
import com.xala.gym.dto.response.PtMatchingResponse;
import com.xala.gym.entity.Booking;
import com.xala.gym.entity.Employee;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.BookingRepository;
import com.xala.gym.repository.EmployeeRepository;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.service.PtMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PtMatchingServiceImpl implements PtMatchingService {

    private final BookingRepository bookingRepository;
    private final EmployeeRepository employeeRepository;
    private final PackageRepository packageRepository;

    @Override
    public List<PtMatchingResponse> matchPt(PtMatchingRequest request) {
        // 1. Lấy thông tin Package để dùng match chuyên môn
        Package selectedPackage = null;
        if (request.getPackageId() != null) {
            selectedPackage = packageRepository.findById(request.getPackageId()).orElse(null);
        }

        // 2. Tìm tất cả các Booking "AVAILABLE" ở hiện tại về sau
        LocalDateTime now = LocalDateTime.now();
        List<Booking> availableBookings = bookingRepository.findByStatusOrderByStartTimeDesc("AVAILABLE");
        
        List<Booking> validBookings = availableBookings.stream()
                .filter(b -> b.getStartTime().isAfter(now))
                .collect(Collectors.toList());

        // Lọc theo khung giờ Member mong muốn (Khung giờ member yêu cầu phải GIAO / NẰM TRONG khoảng thời gian rảnh của PT)
        // PT's start time <= Member's start time AND PT's end time >= Member's end time
        if (request.getPreferredStartTime() != null) {
            validBookings = validBookings.stream()
                    .filter(b -> !b.getStartTime().isAfter(request.getPreferredStartTime()))
                    .collect(Collectors.toList());
        }
        if (request.getPreferredEndTime() != null) {
            validBookings = validBookings.stream()
                    .filter(b -> !b.getEndTime().isBefore(request.getPreferredEndTime()))
                    .collect(Collectors.toList());
        }

        // 3. Gom nhóm theo PT (Dùng Map để lưu Rating/Score cao nhất cho mỗi PT)
        Map<Long, PtMatchingResponse> bestMatches = new HashMap<>();

        for (Booking booking : validBookings) {
            Long ptId = booking.getPersonalTrainer().getId();
            
            // Xử lý nhánh (nếu có truyền branchId thì chỉ lấy PT ở cơ sở đó)
            Employee ptEmp = employeeRepository.findByUser_Id(ptId).orElse(null);
            if (ptEmp == null) continue;
            if (request.getBranchId() != null) {
                if (ptEmp.getGymLocation() == null || !ptEmp.getGymLocation().getId().equals(request.getBranchId())) {
                    continue;
                }
            }

            // Tính điểm chuyên môn
            int score = calculateMatchScore(ptEmp, selectedPackage);

            // Cập nhật best match của PT này (Lưu giữ khung giờ gần nhất/phù hợp nhất)
            if (!bestMatches.containsKey(ptId)) {
                PtMatchingResponse response = PtMatchingResponse.builder()
                        .ptId(ptId)
                        .ptName(ptEmp.getUser().getFullName())
                        .ptSpecialty(ptEmp.getPtSpecialty())
                        .ptExperience(ptEmp.getPtExperience())
                        .ptBio(ptEmp.getPtBio())
                        .ptRating(ptEmp.getPtRating() != null ? ptEmp.getPtRating() : 0.0)
                        .matchScore(score)
                        .matchPercentage(Math.min(100, (int) Math.round((score / 100.0) * 100) + (ptEmp.getPtRating() != null ? (int)(ptEmp.getPtRating() * 2) : 0)))
                        .availableSlotId(booking.getId())
                        .availableStartTime(booking.getStartTime())
                        .availableEndTime(booking.getEndTime())
                        .build();
                bestMatches.put(ptId, response);
            } else {
                // Nếu PT này đã có trong map, ta có thể update slotId nếu cái này gần hơn,
                // nhưng data Booking đã sort descending hoặc ascending, tuỳ logic ưu tiên (Ở đây lấy slot đầu tiên tìm thấy)
                // Cải tiến: Nếu thời gian của booking này gần với the preferredTime hơn.
            }
        }

        // 4. Sắp xếp danh sách trả về theo tỷ lệ phần trăm (matchPercentage) giảm dần, sau đó theo Rating giảm dần
        List<PtMatchingResponse> results = new ArrayList<>(bestMatches.values());
        results.sort((a, b) -> {
            if (!b.getMatchPercentage().equals(a.getMatchPercentage())) {
                return b.getMatchPercentage().compareTo(a.getMatchPercentage());
            }
            return Double.compare(b.getPtRating(), a.getPtRating());
        });

        return results;
    }

    private int calculateMatchScore(Employee employee, Package gymPackage) {
        int score = 0;
        
        // Cơ sở điểm: Kinh nghiệm
        if (employee.getPtExperience() != null) {
            if (employee.getPtExperience().toLowerCase().contains("năm")) {
                score += 5; // Có ghi số năm kinh nghiệm
            }
        }

        if (gymPackage == null) return score;

        String specialty = employee.getPtSpecialty() != null ? employee.getPtSpecialty().toLowerCase() : "";
        String category = gymPackage.getCategory() != null ? gymPackage.getCategory().toLowerCase() : "";
        String pkgName = gymPackage.getName() != null ? gymPackage.getName().toLowerCase() : "";

        // So khớp chuyên môn PT với Gói tập
        if (!specialty.isEmpty() && (!category.isEmpty() || !pkgName.isEmpty())) {
            // VD category: "MUSCLE", "WEIGHT_LOSS", "YOGA", "CARDIO"
            if (category.contains("muscle") && (specialty.contains("tăng cơ") || specialty.contains("gym") || specialty.contains("bodybuilding"))) {
                score += 50;
            } else if ((category.contains("weight") || category.contains("loss") || category.contains("fat")) && (specialty.contains("giảm cân") || specialty.contains("giảm mỡ") || specialty.contains("đốt mỡ"))) {
                score += 50;
            } else if (category.contains("yoga") && (specialty.contains("yoga") || specialty.contains("dẻo dai"))) {
                score += 50;
            } else if (category.contains("cardio") && (specialty.contains("cardio") || specialty.contains("thể lực"))) {
                score += 50;
            } else if (category.contains("boxing") && specialty.contains("boxing")) {
                score += 50;
            }

            // So khớp text thẳng
            if (specialty.contains(category) || category.contains(specialty)) {
                score += 30;
            }
            
            // So khớp nhan đề (ít chính xác hơn nhưng vớt vát)
            if (pkgName.contains("giảm") && specialty.contains("giảm")) score += 20;
            if (pkgName.contains("cơ") && specialty.contains("cơ")) score += 20;
        }

        return score;
    }
}
