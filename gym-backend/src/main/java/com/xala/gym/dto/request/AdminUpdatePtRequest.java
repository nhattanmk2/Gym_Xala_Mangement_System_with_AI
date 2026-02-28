package com.xala.gym.dto.request;

import lombok.Data;

@Data
public class AdminUpdatePtRequest {
    private String fullName;
    private String phone;
    private String ptSpecialty;
    private Integer positionId;
    private Integer gymLocationId;
    private Boolean status;
}
