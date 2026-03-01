package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PtScheduleResponse {
    private Long id;
    private Long ptId;
    private String ptName;
    private String branchName;
    private Long memberId;
    private String memberName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // AVAILABLE, PENDING, CONFIRMED, COMPLETED, CANCELLED, ABSENT
    private String ptPhone;
    private String ptSpecialty;
    private String adminNotes;
}
