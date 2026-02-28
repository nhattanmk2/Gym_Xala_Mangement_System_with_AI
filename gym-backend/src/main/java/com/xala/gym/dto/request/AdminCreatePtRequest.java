package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class AdminCreatePtRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String phone;
    
    // PT specific info
    private String ptSpecialty;
    
    // Employment info
    private Integer positionId;
    private Integer gymLocationId;
}
