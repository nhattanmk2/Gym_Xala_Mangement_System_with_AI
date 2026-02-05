package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class VerifyRequest {
    private String username;
    private Double verificationCode;
}
