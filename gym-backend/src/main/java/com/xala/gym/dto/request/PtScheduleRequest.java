package com.xala.gym.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PtScheduleRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
