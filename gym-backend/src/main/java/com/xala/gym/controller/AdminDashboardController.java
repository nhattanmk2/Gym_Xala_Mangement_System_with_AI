package com.xala.gym.controller;

import com.xala.gym.dto.response.DashboardStatsResponse;
import com.xala.gym.repository.EmployeeRepository;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final MemberRepository memberRepository;
    private final EmployeeRepository employeeRepository;
    private final PackageRepository packageRepository;
    private final MembershipCardRepository membershipCardRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        long totalMembers = memberRepository.count();
        long totalPTs = employeeRepository.count(); // Actually all employees are PTs for now based on Employee structure
        long totalPackages = packageRepository.count();

        // Using findInvoicesByFilters to count PENDING invoices since there's no bookings yet
        long pendingInvoices = membershipCardRepository.findInvoicesByFilters("PENDING", null, null, null).size();

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalMembers(totalMembers)
                .totalPTs(totalPTs)
                .totalPackages(totalPackages)
                .todayBookings(pendingInvoices) // Re-using this as "Pending Invoices" 
                .build();

        return ResponseEntity.ok(response);
    }
}
