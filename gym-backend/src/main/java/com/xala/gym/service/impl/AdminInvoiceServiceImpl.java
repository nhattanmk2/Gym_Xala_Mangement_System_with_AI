package com.xala.gym.service.impl;

import com.xala.gym.dto.response.InvoiceResponse;
import com.xala.gym.entity.MembershipCard;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.service.AdminInvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminInvoiceServiceImpl implements AdminInvoiceService {

    private final MembershipCardRepository membershipCardRepository;

    @Override
    public List<InvoiceResponse> getInvoices(String status, String memberCode, String registrationDate) {
        LocalDateTime startOfDay = null;
        LocalDateTime endOfDay = null;

        if (registrationDate != null && !registrationDate.isEmpty()) {
            LocalDate date = LocalDate.parse(registrationDate, DateTimeFormatter.ISO_LOCAL_DATE);
            startOfDay = date.atStartOfDay();
            endOfDay = date.plusDays(1).atStartOfDay().minusSeconds(1);
        }

        Long memberId = null;
        if (memberCode != null && !memberCode.isEmpty()) {
            try {
                // Trích xuất số từ chuỗi (ví dụ: "MEM0001" -> 1, "0001" -> 1)
                String numericPart = memberCode.replaceAll("[^0-9]", "");
                if (!numericPart.isEmpty()) {
                    memberId = Long.parseLong(numericPart);
                }
            } catch (Exception e) {
                log.warn("Lỗi khi parse mã hội viên: {}", memberCode);
            }
        }

        List<MembershipCard> cards = membershipCardRepository.findInvoicesByFilters(
                status, memberId, startOfDay, endOfDay
        );

        return cards.stream().map(this::mapToInvoiceResponse).collect(Collectors.toList());
    }

    @Override
    public InvoiceResponse updateInvoiceStatus(Long id, String status) {
        MembershipCard card = membershipCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice (MembershipCard) not found"));

        card.setStatus(status);

        // Nếu duyệt thanh toán sang ACTIVE -> Kích hoạt thẻ tập
        if ("ACTIVE".equalsIgnoreCase(status)) {
            LocalDate today = LocalDate.now();
            card.setStartDate(today);

            if (card.getGymPackage() != null && card.getGymPackage().getDurationInDays() != null) {
                card.setEndDate(today.plusDays(card.getGymPackage().getDurationInDays()));
                if (card.getGymPackage().getMaxSessions() != null) {
                    card.setRemainingSessions(card.getGymPackage().getMaxSessions());
                }
            } else {
                // Mặc định 30 ngày nếu dữ liệu gói bị thiếu
                card.setEndDate(today.plusDays(30));
                // Đảm bảo số buổi tập vẫn được gán
                if (card.getGymPackage() != null && card.getGymPackage().getMaxSessions() != null) {
                    card.setRemainingSessions(card.getGymPackage().getMaxSessions());
                }
            }
        }

        MembershipCard updatedCard = membershipCardRepository.save(card);
        return mapToInvoiceResponse(updatedCard);
    }

    private InvoiceResponse mapToInvoiceResponse(MembershipCard card) {
        return InvoiceResponse.builder()
                .id(card.getId())
                .memberCode(card.getMember() != null ? "MEM" + String.format("%04d", card.getMember().getId()) : "")
                .memberName(card.getMember() != null ? card.getMember().getName() : "")
                .packageName(card.getGymPackage() != null ? card.getGymPackage().getName() : "")
                .amount(card.getGymPackage() != null ? card.getGymPackage().getPrice() : 0.0)
                .registrationDate(card.getCreatedAt())
                .status(card.getStatus())
                .build();
    }
}
