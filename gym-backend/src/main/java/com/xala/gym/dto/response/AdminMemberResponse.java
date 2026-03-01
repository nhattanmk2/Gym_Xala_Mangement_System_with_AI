package com.xala.gym.dto.response;

import com.xala.gym.entity.enums.GoalType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminMemberResponse {

    private Long id;
    private String name;
    private String email;
    private String cccd;
    private String phone;
    private String sex;
    private Boolean status;

    private Float height;
    private Float weight;
    private Float bmi;
    private GoalType goalType;
}