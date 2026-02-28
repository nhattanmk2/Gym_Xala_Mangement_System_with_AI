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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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

        LocalDate endDate = request.getStartDate().plusDays(gymPackage.getDurationInDays());

        MembershipCard card = MembershipCard.builder()
                .member(member)
                .gymPackage(gymPackage)
                .startDate(request.getStartDate())
                .endDate(endDate)
                .status("ACTIVE")
                .build();

        MembershipCard saved = cardRepository.save(card);
        return mapToResponse(saved);
    }

    @Override
    public List<MembershipCardResponse> getMyCards(String username) {
        Member member = memberRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member cho: " + username));
        return cardRepository.findByMemberId(member.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
