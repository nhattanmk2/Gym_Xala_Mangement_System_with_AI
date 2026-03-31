package com.xala.gym.service.impl;

import com.xala.gym.dto.request.MembershipRegistrationRequest;
import com.xala.gym.dto.response.MembershipCardResponse;
import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.MembershipCard;
import com.xala.gym.entity.Package;
import com.xala.gym.entity.Employee;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.repository.EmployeeRepository;
import com.xala.gym.entity.MembershipPauseHistory;
import com.xala.gym.repository.MembershipPauseHistoryRepository;
import java.time.temporal.ChronoUnit;
import com.xala.gym.service.MembershipCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipCardServiceImpl implements MembershipCardService {

    private final MembershipCardRepository cardRepository;
    private final MemberRepository memberRepository;
    private final PackageRepository packageRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final MembershipPauseHistoryRepository pauseHistoryRepository;

    @Override
    @Transactional
    public MembershipCardResponse registerPackage(String username, MembershipRegistrationRequest request) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thành viên cho: " + username));

        Package gymPackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Gói tập không tồn tại"));

        // Kiểm tra xem đã có gói active hay chưa - sử dụng existsBy để chính xác hơn
        log.info("Checking active status for member ID: {}", member.getId());
        boolean hasActive = cardRepository.existsByMemberIdAndStatus(member.getId(), "ACTIVE");
        log.info("Has active package result: {}", hasActive);
        
        if (hasActive) {
            log.warn("Registration rejected: Member {} already has an active package", username);
            throw new IllegalArgumentException("Bạn hiện đang có một gói tập đang hoạt động. Vui lòng hủy hoặc đợi gói cũ hết hạn trước khi đăng ký mới.");
        }

        // Chặn đăng ký gói đã ngừng kinh doanh
        if (gymPackage.getActive() != null && !gymPackage.getActive()) {
            throw new IllegalArgumentException("Gói tập này hiện đã ngừng kinh doanh. Vui lòng chọn gói tập khác.");
        }

        LocalDate endDate = request.getStartDate().plusDays(gymPackage.getDurationInDays());

        MembershipCard card = MembershipCard.builder()
                .member(member)
                .gymPackage(gymPackage)
                .startDate(request.getStartDate())
                .endDate(endDate)
                .status("PENDING") // Luôn là PENDING để chờ Admin duyệt
                .build();

        MembershipCard saved = cardRepository.save(card);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipCardResponse> getMyCards(String username) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));
        return cardRepository.findByMemberId(member.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipCardResponse> getMemberCards(Long memberId) {
        return cardRepository.findByMemberId(memberId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipCardResponse getCurrentCard(String username) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));
        
        return cardRepository.findFirstByMemberIdAndStatusInOrderByEndDateDesc(member.getId(), java.util.List.of("ACTIVE", "PAUSED"))
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public void cancelCard(String username, Long cardId) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));

        MembershipCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin gói tập với ID: " + cardId));

        if (!card.getMember().getId().equals(member.getId())) {
            throw new IllegalStateException("Bạn không có quyền hủy gói tập này");
        }

        if (!"ACTIVE".equals(card.getStatus()) && !"PENDING".equals(card.getStatus())) {
            throw new IllegalStateException("Gói tập này hiện không ở trạng thái có thể hủy (Trạng thái hiện tại: " + card.getStatus() + ")");
        }

        card.setStatus("CANCELLED"); // Sử dụng CANCELLED đồng nhất với hệ thống
        cardRepository.save(card);
    }

    @Override
    @Transactional
    public void approveCard(Long cardId, Double customPrice) {
        MembershipCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin gói tập với ID: " + cardId));
                
        if (!"PENDING".equals(card.getStatus())) {
            throw new IllegalStateException("Gói tập không ở trạng thái chờ duyệt.");
        }
        
        if (customPrice != null) {
            card.setCustomPrice(customPrice);
        }
        
        card.setStatus("ACTIVE");
        cardRepository.save(card);
    }

    @Override
    @Transactional
    public void assignPt(String username, Long cardId, Long ptId) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));

        MembershipCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin gói tập với ID: " + cardId));

        if (!card.getMember().getId().equals(member.getId())) {
            throw new IllegalStateException("Bạn không có quyền gán PT cho gói tập này");
        }

        if (!"ACTIVE".equals(card.getStatus()) && !"PENDING".equals(card.getStatus())) {
            throw new IllegalStateException("Gói tập hiện không ở trạng thái cho phép gán PT");
        }

        Employee pt = employeeRepository.findByUser_Id(ptId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Huấn luyện viên với ID: " + ptId));

        // Kiểm tra xem PT có trong danh sách PT của gói này không
        boolean isPtInPackage = card.getGymPackage().getPersonalTrainers().stream()
                .anyMatch(p -> p.getId().equals(ptId));

        if (!isPtInPackage) {
            throw new IllegalArgumentException("Huấn luyện viên này không phụ trách gói tập của bạn.");
        }

        card.setAssignedPt(pt);
        cardRepository.save(card);
    }

    @Override
    @Transactional
    public void pauseCard(String username, Long cardId, String reason) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));

        MembershipCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin gói tập với ID: " + cardId));

        if (!card.getMember().getId().equals(member.getId())) {
            throw new IllegalStateException("Bạn không có quyền bảo lưu gói tập này");
        }

        if (!"ACTIVE".equals(card.getStatus())) {
            throw new IllegalStateException("Gói tập hiện không ở trạng thái hoạt động để có thể bảo lưu.");
        }

        card.setStatus("PAUSED");
        cardRepository.save(card);

        MembershipPauseHistory history = MembershipPauseHistory.builder()
                .membershipCard(card)
                .pauseDate(LocalDate.now())
                .reason(reason != null ? reason : "Bảo lưu theo yêu cầu cá nhân")
                .build();
        pauseHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public void resumeCard(String username, Long cardId) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));

        MembershipCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin gói tập với ID: " + cardId));

        if (!card.getMember().getId().equals(member.getId())) {
            throw new IllegalStateException("Bạn không có quyền tiếp tục gói tập này");
        }

        if (!"PAUSED".equals(card.getStatus())) {
            throw new IllegalStateException("Gói tập không ở trạng thái bảo lưu.");
        }

        MembershipPauseHistory history = pauseHistoryRepository
                .findFirstByMembershipCardIdAndResumeDateIsNullOrderByCreatedAtDesc(cardId)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy lịch sử bảo lưu hợp lệ."));

        history.setResumeDate(LocalDate.now());
        pauseHistoryRepository.save(history);

        // Tính toán lại ngày kết thúc gói tập
        long daysPaused = ChronoUnit.DAYS.between(history.getPauseDate(), history.getResumeDate());
        if (card.getEndDate() != null) {
            card.setEndDate(card.getEndDate().plusDays(daysPaused));
        }
        
        card.setStatus("ACTIVE");
        cardRepository.save(card);
    }

    private MembershipCardResponse mapToResponse(MembershipCard card) {
        MembershipCardResponse.MembershipCardResponseBuilder builder = MembershipCardResponse.builder()
                .id(card.getId())
                .packageId(card.getGymPackage().getId())
                .packageName(card.getGymPackage().getName())
                .category(card.getGymPackage().getCategory())
                .startDate(card.getStartDate())
                .endDate(card.getEndDate())
                .status(card.getStatus())
                .maxSessions(card.getGymPackage() != null ? card.getGymPackage().getMaxSessions() : 0)
                .remainingSessions(card.getRemainingSessions())
                .originalPrice(card.getGymPackage() != null ? card.getGymPackage().getPrice() : null)
                .customPrice(card.getCustomPrice());

        if (card.getAssignedPt() != null && card.getAssignedPt().getUser() != null) {
            builder.assignedPtId(card.getAssignedPt().getUser().getId());
            builder.assignedPtName(card.getAssignedPt().getName());
            if (card.getAssignedPt().getGymLocation() != null) {
                builder.assignedPtLocationName(card.getAssignedPt().getGymLocation().getName());
            }
        }

        if (card.getGymPackage() != null && card.getGymPackage().getPersonalTrainers() != null) {
            builder.availablePts(card.getGymPackage().getPersonalTrainers().stream()
                    .map(pt -> AdminPtResponse.builder()
                            .id(pt.getUser() != null ? pt.getUser().getId() : pt.getId()) // Use User ID for scheduling
                            .userId(pt.getUser() != null ? pt.getUser().getId() : null)
                            .name(pt.getName())
                            .ptSpecialty(pt.getPtSpecialty())
                            .avatar(pt.getAvatar() != null ? java.util.Base64.getEncoder().encodeToString(pt.getAvatar()) : null)
                            .ptRating(pt.getUser() != null ? pt.getUser().getAverageRating() : null)
                            .build())
                    .collect(java.util.stream.Collectors.toList()));
        }

        return builder.build();
    }
}
