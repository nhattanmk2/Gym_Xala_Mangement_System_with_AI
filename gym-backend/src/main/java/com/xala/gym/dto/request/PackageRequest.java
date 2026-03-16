package com.xala.gym.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PackageRequest {
    @NotNull(message = "Tên gói không được để trống")
    private String name;
    private String description;
    @NotNull(message = "Giá không được để trống")
    @Min(value = 1, message = "Giá phải lớn hơn 0")
    private Double price;
    @NotNull(message = "Thời gian không được để trống")
    @Min(value = 1, message = "Thời gian phải ít nhất 1 ngày")
    private Integer durationInDays;
    private Integer maxSessions;
    private String category;
    private Boolean active;
    private String promotion;
    private java.util.List<WorkoutRoadmapRequest> roadmaps;
    private java.util.List<Long> ptIds;
}