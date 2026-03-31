package com.xala.gym.controller;

import com.xala.gym.dto.response.ChartDataResponse;
import com.xala.gym.dto.response.DashboardStatsResponse;
import com.xala.gym.dto.response.PtRankingResponse;
import com.xala.gym.dto.response.PtPerformanceResponse;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.MembershipCard;
import com.xala.gym.entity.Package;
import com.xala.gym.entity.User;
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

    private Range calculateRange(String filter, String baseDateStr) {
        LocalDateTime pivot = (baseDateStr != null) ? 
            LocalDate.parse(baseDateStr).atStartOfDay() : LocalDateTime.now();
        
        LocalDateTime start;
        LocalDateTime end;
        String label;

        if ("week".equalsIgnoreCase(filter)) {
            // Monday of the week
            start = pivot.with(java.time.DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
            end = start.plusDays(7).minusNanos(1);
            label = "Tuần " + start.format(DateTimeFormatter.ofPattern("dd/MM")) + " - " + 
                    end.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } else if ("year".equalsIgnoreCase(filter)) {
            start = pivot.withDayOfYear(1).toLocalDate().atStartOfDay();
            end = start.plusYears(1).minusNanos(1);
            label = "Năm " + start.getYear();
        } else {
            // month
            start = pivot.withDayOfMonth(1).toLocalDate().atStartOfDay();
            end = start.plusMonths(1).minusNanos(1);
            label = "Tháng " + start.format(DateTimeFormatter.ofPattern("MM/yyyy"));
        }

        return new Range(start, end, label);
    }

    private static class Range {
        final LocalDateTime start;
        final LocalDateTime end;
        final String label;

        Range(LocalDateTime start, LocalDateTime end, String label) {
            this.start = start;
            this.end = end;
            this.label = label;
        }
    }

    @GetMapping("/member-growth")
    public ResponseEntity<ChartDataResponse> getMemberGrowth(
            @RequestParam(defaultValue = "month") String filter,
            @RequestParam(required = false) String baseDate) {
        
        Range range = calculateRange(filter, baseDate);
        LocalDate startDate = range.start.toLocalDate();
        LocalDate endDate = range.end.toLocalDate();

        List<String> labels = new ArrayList<>();
        List<Long> newRegistrationsArr = new ArrayList<>();
        List<Long> activeTrends = new ArrayList<>();

        if ("year".equalsIgnoreCase(filter)) {
            // Xử lý theo THÁNG cho View Năm
            List<Map<String, Object>> dbResults = membershipCardRepository.countMembershipsGroupedByMonth(range.start, range.end);
            Map<String, Long> monthDataMap = new HashMap<>(); // key: "MM/yyyy"
            for (Map<String, Object> row : dbResults) {
                int m = (int) row.get("month");
                int y = (int) row.get("year");
                monthDataMap.put(String.format("%02d/%d", m, y), ((Number) row.get("count")).longValue());
            }

            for (int i = 1; i <= 12; i++) {
                String labelStr = String.format("%02d/%d", i, startDate.getYear());
                labels.add("T" + i);
                newRegistrationsArr.add(monthDataMap.getOrDefault(labelStr, 0L));

                // Active trend: Lấy số lượng active vào ngày cuối cùng của tháng đó
                LocalDate endOfMonth = startDate.withMonth(i).with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());
                List<MembershipCard> activeAtEnd = membershipCardRepository.findAllActiveInPeriod(endOfMonth, endOfMonth);
                activeTrends.add((long) activeAtEnd.size());
            }
        } else {
            // Xử lý theo NGÀY cho View Tuần/Tháng
            List<Map<String, Object>> dbResults = membershipCardRepository.countMembershipsGroupedByDate(range.start, range.end);
            Map<LocalDate, Long> newRegMap = new HashMap<>();
            for (Map<String, Object> row : dbResults) {
                java.sql.Date sqlDate = (java.sql.Date) row.get("regDate");
                Long count = ((Number) row.get("count")).longValue();
                if (sqlDate != null) {
                    newRegMap.put(sqlDate.toLocalDate(), count);
                }
            }

            // Lấy toàn bộ active cards trong khoảng để tối ưu stream thay vì query liên tục
            List<MembershipCard> activeInPeriod = membershipCardRepository.findAllActiveInPeriod(startDate, endDate);

            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM");
            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                labels.add(date.format(df));
                newRegistrationsArr.add(newRegMap.getOrDefault(date, 0L));

                final LocalDate current = date;
                long activeCount = activeInPeriod.stream()
                    .filter(mc -> !mc.getStartDate().isAfter(current) && !mc.getEndDate().isBefore(current))
                    .count();
                activeTrends.add(activeCount);
            }
        }

        return ResponseEntity.ok(ChartDataResponse.builder()
                .labels(labels)
                .data(newRegistrationsArr)
                .secondData(activeTrends)
                .build());
    }

    @GetMapping("/revenue-stats")
    public ResponseEntity<ChartDataResponse> getRevenueStats(
            @RequestParam(defaultValue = "year") String filter,
            @RequestParam(required = false) String baseDate) {
        
        Range range = calculateRange(filter, baseDate);
        List<Object[]> dbResults = membershipCardRepository.getMonthlyRevenueStats(range.start, range.end);

        List<String> labels = new ArrayList<>();
        List<Long> revenueData = new ArrayList<>();

        if ("year".equalsIgnoreCase(filter)) {
            // Đảm bảo đủ 12 tháng kể cả khi ko có data
            Map<Integer, Long> yearDataMap = new HashMap<>();
            for (Object[] row : dbResults) {
                int m = ((Number) row[0]).intValue();
                double rev = ((Number) row[2]).doubleValue();
                yearDataMap.put(m, Math.round(rev));
            }

            for (int i = 1; i <= 12; i++) {
                labels.add("T" + i);
                revenueData.add(yearDataMap.getOrDefault(i, 0L));
            }
        } else {
            // View tuần/tháng cho doanh thu (hiện tại user yêu cầu biểu đồ tháng trong năm nên cái này phụ trợ)
            for (Object[] row : dbResults) {
                labels.add("Tháng " + row[0] + "/" + row[1]);
                revenueData.add(Math.round(((Number) row[2]).doubleValue()));
            }
        }

        return ResponseEntity.ok(ChartDataResponse.builder()
                .labels(labels)
                .data(revenueData)
                .build());
    }

    @GetMapping("/pt-ranking")
    public ResponseEntity<List<PtRankingResponse>> getPtRanking(
            @RequestParam(defaultValue = "month") String filter,
            @RequestParam(required = false) String baseDate) {
        
        Range range = calculateRange(filter, baseDate);
        List<Map<String, Object>> dbResults = bookingRepository.getPtRankingByCompletedSessions(range.start, range.end);

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
    public ResponseEntity<List<PtPerformanceResponse>> getPtPerformance(
            @RequestParam(defaultValue = "month") String filter,
            @RequestParam(required = false) String baseDate) {
        
        Range range = calculateRange(filter, baseDate);
        
        List<Map<String, Object>> rankingResults = bookingRepository.getPtRankingByCompletedSessions(range.start, range.end);
        List<Map<String, Object>> salesResults = membershipCardRepository.getPtSalesStatsByDate(range.start, range.end);
        
        Map<Long, PtPerformanceResponse> ptMap = new HashMap<>();
        
        for (Map<String, Object> row : rankingResults) {
            Long ptId = ((Number) row.get("ptId")).longValue();
            String ptName = (String) row.get("ptName");
            int completedSessions = ((Number) row.get("completedSessions")).intValue();
            
            ptMap.put(ptId, PtPerformanceResponse.builder()
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
            
            PtPerformanceResponse stat = ptMap.get(ptId);
            if(stat == null) {
                stat = PtPerformanceResponse.builder()
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
        
        List<PtPerformanceResponse> response = new ArrayList<>(ptMap.values());
        response.sort((a, b) -> Double.compare(b.getRevenue(), a.getRevenue())); // Sort descending by revenue
        
        return ResponseEntity.ok(response);
    }
}
