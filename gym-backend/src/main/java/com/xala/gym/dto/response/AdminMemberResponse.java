package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminMemberResponse {

    private Integer id;
    private String name;
    private String cccd;
    private String email;
    private String phone;
    private Boolean status;
}