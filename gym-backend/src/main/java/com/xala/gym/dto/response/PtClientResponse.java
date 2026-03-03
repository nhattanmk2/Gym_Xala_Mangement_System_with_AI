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
public class PtClientResponse {
    private Long memberId;
    private String memberName;
    private String email;
    private String phone;

    private Float height;
    private Float weight;
    private Float bmi;
    private String goalType;

    private String activePackageName;
    private LocalDate packageEndDate;
}
