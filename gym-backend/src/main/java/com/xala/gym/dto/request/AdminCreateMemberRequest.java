package com.xala.gym.dto.request;

import com.xala.gym.entity.enums.GoalType;
import lombok.Data;

@Data
public class AdminCreateMemberRequest {

    private String username;
    private String password;

    private String name;
    private String cccd;
    private String email;
    private String phone;
    private String sex;
    private Boolean status;

    private Float height;
    private Float weight;
    private GoalType goalType;
    private String availabilitySlots;

    private Integer gymLocationId;
}