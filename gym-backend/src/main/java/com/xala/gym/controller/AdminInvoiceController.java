package com.xala.gym.controller;

import com.xala.gym.dto.response.InvoiceResponse;
import com.xala.gym.service.AdminInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInvoiceController {

    private final AdminInvoiceService adminInvoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getInvoices(
            @RequestParam(required = false, defaultValue = "PENDING") String status,
            @RequestParam(required = false) String memberCode,
            @RequestParam(required = false) String registrationDate
    ) {
        return ResponseEntity.ok(adminInvoiceService.getInvoices(status, memberCode, registrationDate));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(adminInvoiceService.updateInvoiceStatus(id, status));
    }
}
