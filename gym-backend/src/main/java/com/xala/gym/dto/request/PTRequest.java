package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class PTRequest {
    // Thông tin tài khoản
    private String username;
    private String password; // Chỉ dùng khi tạo mới
    private String email;

    // Thông tin cá nhân
    private String name;
    private String phone;
    private String cccd;
    private String sex;
    private String address;

    // Thông tin chuyên môn (Quan trọng cho AI)
    private String ptSpecialty; // GIAM_CAN, TANG_CO...
    private Integer gymLocationId;
}