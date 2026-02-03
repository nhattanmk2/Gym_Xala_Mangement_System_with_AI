package com.xala.gym.dto.request;

import com.xala.gym.entity.enums.GoalType;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String phone;

    // Các trường quan trọng cho AI
    private Float height;
    private Float weight;
    private GoalType goalType;

    // Nhận lịch rảnh từ Client: ["MON_MORNING", "WED_EVENING"]
    private List<String> availabilitySlots;

    // Nếu đăng ký làm PT
//    private String ptSpecialty;
//
//    private String role;
}