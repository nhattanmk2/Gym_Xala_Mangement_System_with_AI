package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class MemberUpdateRequest {
    private String name;
    private String phone;
    private Boolean status; // Khóa/Mở khóa tài khoản

    // Admin có thể cập nhật chỉ số giúp Member nếu cần
    private Float height;
    private Float weight;
}
