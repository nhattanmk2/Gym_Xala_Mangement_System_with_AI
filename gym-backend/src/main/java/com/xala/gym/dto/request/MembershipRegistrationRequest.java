package com.xala.gym.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MembershipRegistrationRequest {
    @NotNull(message = "ID gói tập không được để trống")
    private Long packageId;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
}
