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
public class MembershipCardResponse {
    private Long id;
    private Long packageId;
    private String packageName;
    private String category;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer remainingSessions;
    private Long assignedPtId;
    private String assignedPtName;
    private String assignedPtLocationName;
    private java.util.List<AdminPtResponse> availablePts;
}
