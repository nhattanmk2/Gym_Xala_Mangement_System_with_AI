package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PtMatchingResponse {
    private Long ptId;
    private String ptName;
    private String ptSpecialty;
    private String ptExperience;
    private String ptBio;
    private Double ptRating;
    
    // Thuật toán chấm điểm
    private Integer matchScore;
    private Integer matchPercentage;
    
    // Gợi ý khung giờ rảnh phù hợp nhất với yêu cầu
    private Long availableSlotId;
    private java.time.LocalDateTime availableStartTime;
    private java.time.LocalDateTime availableEndTime;
}
