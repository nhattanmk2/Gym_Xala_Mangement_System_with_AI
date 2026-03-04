package com.xala.gym.service;

import com.xala.gym.dto.request.PtMatchingRequest;
import com.xala.gym.dto.response.PtMatchingResponse;

import java.util.List;

public interface PtMatchingService {
    List<PtMatchingResponse> matchPt(PtMatchingRequest request);
}
