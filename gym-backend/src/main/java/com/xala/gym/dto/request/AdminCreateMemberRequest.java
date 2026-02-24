package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class AdminCreateMemberRequest {

    private String username;
    private String password;
    private String email;

    private String name;
    private String cccd;
    private String phone;
    private String sex;
}