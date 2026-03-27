package com.xala.gym.controller;

import com.xala.gym.dto.response.ChartDataResponse;
import com.xala.gym.dto.response.DashboardStatsResponse;
import com.xala.gym.dto.response.PtRankingResponse;
import com.xala.gym.repository.BookingRepository;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final MembershipCardRepository membershipCardRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        long totalMembers = memberRepository.countActiveMembers();
        long totalPTs = userRepository.countTotalPTs();
        long totalPackages = packageRepository.count();

        // Pending invoices count optimized
        long pendingInvoices = membershipCardRepository.countByStatus("PENDING");

        // Doanh thu tháng hiện tại
        LocalDate now = LocalDate.now();
        Double revenue = membershipCardRepository.calculateRevenueByMonthAndYear(now.getMonthValue(), now.getYear());
        double monthlyRevenue = revenue != null ? revenue : 0.0;

        // Số thành viên từng chi nhánh
        List<Map<String, Object>> activeMembersList = memberRepository.countActiveMembersByBranch();
        Map<String, Long> activeMembersByBranch = new HashMap<>();
        if (activeMembersList != null) {
            for (Map<String, Object> map : activeMembersList) {
                String branch = (String) map.get("branch");
                Long count = ((Number) map.get("count")).longValue();
                activeMembersByBranch.put(branch != null ? branch : "Chưa gắn chi nhánh", count);
            }
        }

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalMembers(totalMembers)
                .totalPTs(totalPTs)
                .totalPackages(totalPackages)
                .todayBookings(pendingInvoices)
                .monthlyRevenue(monthlyRevenue)
                .activeMembersByBranch(activeMembersByBranch)
                .build();

        return ResponseEntity.ok(response);
    }

    private LocalDateTime getStartDateFromFilter(String filter) {
        LocalDateTime now = LocalDateTime.now();
        if ("week".equalsIgnoreCase(filter)) {
            return now.minusDays(7);
        } else if ("year".equalsIgnoreCase(filter)) {
            return now.minusMonths(12);
        }
        // default month
        return now.minusDays(30);
    }

    @GetMapping("/member-growth")
    public ResponseEntity<ChartDataResponse> getMemberGrowth(@RequestParam(defaultValue = "month") String filter) {
        LocalDateTime startDate = getStartDateFromFilter(filter);
        List<Map<String, Object>> dbResults = membershipCardRepository.countMembershipsGroupedByDate(startDate);
        
        // Lấy số lượng hội viên ban đầu (trước ngày startDate) để tính lũy kế
        long runningTotal = membershipCardRepository.countDistinctMembersBeforeDate(startDate);

        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();

        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM");

        for (Map<String, Object> row : dbResults) {
            java.sql.Date sqlDate = (java.sql.Date) row.get("regDate");
            Long count = ((Number) row.get("count")).longValue();
            
            if (sqlDate != null) {
                LocalDate date = sqlDate.toLocalDate();
                labels.add(date.format(df));
                
                // Tính lũy kế
                runningTotal += count;
                data.add(runningTotal);
            }
        }

        ChartDataResponse response = ChartDataResponse.builder()
                .labels(labels)
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pt-ranking")
    public ResponseEntity<List<PtRankingResponse>> getPtRanking(@RequestParam(defaultValue = "month") String filter) {
        LocalDateTime startDate = getStartDateFromFilter(filter);
        List<Map<String, Object>> dbResults = bookingRepository.getPtRankingByCompletedSessions(startDate);

        List<PtRankingResponse> response = dbResults.stream()
                .limit(5) // Top 5 PT
                .map(row -> PtRankingResponse.builder()
                        .ptId(((Number) row.get("ptId")).longValue())
                        .ptName((String) row.get("ptName"))
                        .rating(row.get("rating") != null ? ((Number) row.get("rating")).doubleValue() : 5.0)
                        .completedSessions(((Number) row.get("completedSessions")).intValue())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/pt-performance")
    public ResponseEntity<List<com.xala.gym.dto.response.PtPerformanceResponse>> getPtPerformance(@RequestParam(defaultValue = "month") String filter) {
        LocalDateTime startDate = getStartDateFromFilter(filter);
        
        List<Map<String, Object>> rankingResults = bookingRepository.getPtRankingByCompletedSessions(startDate);
        List<Map<String, Object>> salesResults = membershipCardRepository.getPtSalesStatsByDate(startDate);
        
        Map<Long, com.xala.gym.dto.response.PtPerformanceResponse> ptMap = new HashMap<>();
        
        for (Map<String, Object> row : rankingResults) {
            Long ptId = ((Number) row.get("ptId")).longValue();
            String ptName = (String) row.get("ptName");
            int completedSessions = ((Number) row.get("completedSessions")).intValue();
            
            ptMap.put(ptId, com.xala.gym.dto.response.PtPerformanceResponse.builder()
                .ptId(ptId)
                .ptName(ptName)
                .completedSessions(completedSessions)
                .soldPackages(0)
                .revenue(0.0)
                .build());
        }
        
        for(Map<String, Object> row : salesResults) {
            Long ptId = ((Number) row.get("ptId")).longValue();
            String ptName = (String) row.get("ptName");
            int soldPackages = ((Number) row.get("soldPackages")).intValue();
            double revenue = row.get("revenue") != null ? ((Number) row.get("revenue")).doubleValue() : 0.0;
            
            com.xala.gym.dto.response.PtPerformanceResponse stat = ptMap.get(ptId);
            if(stat == null) {
                stat = com.xala.gym.dto.response.PtPerformanceResponse.builder()
                    .ptId(ptId)
                    .ptName(ptName)
                    .completedSessions(0)
                    .soldPackages(soldPackages)
                    .revenue(revenue)
                    .build();
                ptMap.put(ptId, stat);
            } else {
                stat.setSoldPackages(soldPackages);
                stat.setRevenue(revenue);
            }
        }
        
        List<com.xala.gym.dto.response.PtPerformanceResponse> response = new ArrayList<>(ptMap.values());
        response.sort((a, b) -> Double.compare(b.getRevenue(), a.getRevenue())); // Sort descending by revenue
        
        return ResponseEntity.ok(response);
    }
}
