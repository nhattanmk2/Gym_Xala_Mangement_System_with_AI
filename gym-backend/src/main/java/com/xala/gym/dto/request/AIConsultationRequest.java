package com.xala.gym.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConsultationRequest {
    private double weight;     // kg
    private double height;     // cm
    private int age;           // years
    private String gender;     // "MALE", "FEMALE"
    private String goal;       // "WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTAIN" 
}
