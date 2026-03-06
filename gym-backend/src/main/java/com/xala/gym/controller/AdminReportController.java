package com.xala.gym.controller;

import com.xala.gym.dto.response.ReportMemberSummaryDto;
import com.xala.gym.dto.response.ReportPtPerformanceDto;
import com.xala.gym.dto.response.ReportRevenueDto;
import com.xala.gym.entity.Employee;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.MembershipCard;
import com.xala.gym.repository.BookingRepository;
import com.xala.gym.repository.EmployeeRepository;
import com.xala.gym.repository.MembershipCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final MembershipCardRepository membershipCardRepository;
    private final BookingRepository bookingRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/revenue")
    public ResponseEntity<List<ReportRevenueDto>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        List<MembershipCard> cards = membershipCardRepository.findAllByCreatedAtBetweenWithMemberAndPackage(start, end);

        List<ReportRevenueDto> report = cards.stream().map(c -> ReportRevenueDto.builder()
                .id(c.getId())
                .memberName(c.getMember() != null ? c.getMember().getName() : "N/A")
                .packageName(c.getGymPackage() != null ? c.getGymPackage().getName() : "N/A")
                .amount(c.getGymPackage() != null ? c.getGymPackage().getPrice() : 0.0)
                .registrationDate(c.getCreatedAt().toLocalDate())
                .branchName(c.getMember() != null && c.getMember().getGymLocation() != null ? c.getMember().getGymLocation().getName() : "Chưa xác định")
                .status(c.getStatus())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(report);
    }

    @GetMapping("/pt-performance")
    public ResponseEntity<List<ReportPtPerformanceDto>> getPtPerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        
        List<Map<String, Object>> rankingRaw = bookingRepository.getPtRankingByCompletedSessions(start);
        
        // Batch load employees to avoid N+1
        List<Long> ptUserIds = rankingRaw.stream()
                .map(row -> ((Number) row.get("ptId")).longValue())
                .collect(Collectors.toList());
        
        List<Employee> allEmployees = employeeRepository.findAll(); // Small enough to load once
        Map<Long, Employee> empMap = allEmployees.stream()
                .filter(e -> e.getUser() != null)
                .collect(Collectors.toMap(e -> e.getUser().getId(), e -> e, (a, b) -> a));

        List<ReportPtPerformanceDto> report = rankingRaw.stream().map(row -> {
            Long ptUserId = ((Number) row.get("ptId")).longValue();
            Employee emp = empMap.get(ptUserId);
            
            return ReportPtPerformanceDto.builder()
                    .ptId(ptUserId)
                    .ptName((String) row.get("ptName"))
                    .completedSessions(((Number) row.get("completedSessions")).intValue())
                    .averageRating(row.get("rating") != null ? ((Number) row.get("rating")).doubleValue() : 5.0)
                    .branchName(emp != null && emp.getGymLocation() != null ? emp.getGymLocation().getName() : "N/A")
                    .specialty(emp != null ? emp.getPtSpecialty() : "PT")
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(report);
    }

    @GetMapping("/member-summary")
    public ResponseEntity<List<ReportMemberSummaryDto>> getMemberSummary() {
        List<MembershipCard> cards = membershipCardRepository.findAllWithMemberPackageAndLocation();
        
        List<ReportMemberSummaryDto> report = cards.stream().map(c -> ReportMemberSummaryDto.builder()
                .cardId(c.getId())
                .memberId(c.getMember() != null ? c.getMember().getId() : 0L)
                .memberName(c.getMember() != null ? c.getMember().getName() : "N/A")
                .packageName(c.getGymPackage() != null ? c.getGymPackage().getName() : "N/A")
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .branchName(c.getMember() != null && c.getMember().getGymLocation() != null ? c.getMember().getGymLocation().getName() : "N/A")
                .status(c.getStatus())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(report);
    }
}
