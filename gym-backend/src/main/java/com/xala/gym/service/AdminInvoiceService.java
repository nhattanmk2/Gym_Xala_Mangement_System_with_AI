package com.xala.gym.service;

import com.xala.gym.dto.response.InvoiceResponse;

import java.util.List;

public interface AdminInvoiceService {
    List<InvoiceResponse> getInvoices(String status, String memberCode, String registrationDate);
    InvoiceResponse updateInvoiceStatus(Long id, String status);
}
