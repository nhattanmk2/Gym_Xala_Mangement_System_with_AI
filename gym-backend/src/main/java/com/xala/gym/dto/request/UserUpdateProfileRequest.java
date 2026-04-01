package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class UserUpdateProfileRequest {
    private String fullName;
    private String phone;
    private String cccd;
    private String sex;
}
