package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRevenueDto {
    private Long id;
    private String memberName;
    private String packageName;
    private Double amount;
    private LocalDate registrationDate;
    private String branchName;
    private String status;
}
