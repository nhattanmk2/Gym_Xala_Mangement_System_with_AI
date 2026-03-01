package com.xala.gym.service.impl;

import com.xala.gym.dto.request.MembershipRegistrationRequest;
import com.xala.gym.dto.response.MembershipCardResponse;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.MembershipCard;
import com.xala.gym.entity.Package;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.MembershipCardRepository;
import com.xala.gym.repository.PackageRepository;
import com.xala.gym.repository.UserRepository;
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
    public MembershipCardResponse getCurrentCard(String username) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));
        
        return cardRepository.findFirstByMemberIdAndStatusOrderByEndDateDesc(member.getId(), "ACTIVE")
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

    private MembershipCardResponse mapToResponse(MembershipCard card) {
        return MembershipCardResponse.builder()
                .id(card.getId())
                .packageId(card.getGymPackage().getId())
                .packageName(card.getGymPackage().getName())
                .category(card.getGymPackage().getCategory())
                .startDate(card.getStartDate())
                .endDate(card.getEndDate())
                .status(card.getStatus())
                .build();
    }
}
