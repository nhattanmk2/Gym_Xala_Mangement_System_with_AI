package com.xala.gym.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateMemberRequest {

    private String name;

    private String cccd;

    private String sex;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;

    // id của gymLocation
    private Integer addressGymId;
}