package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalMembers;
    private long totalPTs;
    private long totalPackages;
    private long todayBookings; 
    
    // Thêm các trường mới
    private double monthlyRevenue;
    private Map<String, Long> activeMembersByBranch;
}
