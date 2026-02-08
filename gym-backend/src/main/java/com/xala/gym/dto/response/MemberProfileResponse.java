package com.xala.gym.dto.response;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberProfileResponse {

    private Integer id;

    // User fields
    private String username;
    private String fullName;
    private String email;

    // Member fields
    private String phone;
    private String cccd;
    private String sex;
    private Boolean status;

    // Optional AI fields
    private Float height;
    private Float weight;
    private Float bmi;

    private String goalType;
}
