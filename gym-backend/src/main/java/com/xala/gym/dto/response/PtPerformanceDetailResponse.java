package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PtPerformanceDetailResponse {
    private Long ptId;
    private String ptName;
    private Integer totalStudents;
    private Integer totalSessions;
    private Double averageRating;
    private List<FeedbackDto> feedbacks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackDto {
        private String memberName;
        private Integer rating;
        private String comment;
        private LocalDateTime date;
    }
}
