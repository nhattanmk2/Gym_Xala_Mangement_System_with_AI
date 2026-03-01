package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPtResponse {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String ptSpecialty;
    private String ptExperience;
    private String ptBio;
    private Double ptRating;
    private Boolean status;

    // Detailed fields
    private Integer positionId;
    private String positionName;
    private Integer gymLocationId;
    private String gymLocationName;
    private String avatar; // Base64 string
}
