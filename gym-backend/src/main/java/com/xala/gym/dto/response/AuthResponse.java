package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private String username;

    private String email;

    // Có thể mở rộng sau nếu 1 user nhiều role
    private List<String> roles;
}
