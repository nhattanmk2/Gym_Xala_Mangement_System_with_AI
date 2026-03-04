package com.xala.gym.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PtMatchingRequest {
    private Long packageId;
    private LocalDateTime preferredStartTime;
    private LocalDateTime preferredEndTime;
    private Integer branchId; // Optional: Lọc theo cơ sở
}
