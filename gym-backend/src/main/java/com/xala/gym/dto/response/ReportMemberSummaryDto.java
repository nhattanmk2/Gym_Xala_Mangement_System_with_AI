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
public class ReportMemberSummaryDto {
    private Long cardId;
    private Long memberId;
    private String memberName;
    private String packageName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String branchName;
    private String status;
}
