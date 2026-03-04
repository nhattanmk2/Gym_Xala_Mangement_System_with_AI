package com.xala.gym.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataResponse {
    private List<String> labels; // e.g: ["Mon", "Tue", "Wed"] or ["Jan", "Feb"]
    private List<Long> data; // e.g: [12, 19, 3] new members
}
