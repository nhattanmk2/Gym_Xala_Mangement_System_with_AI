package com.xala.gym.service.impl;

import com.xala.gym.dto.response.MemberProfileResponse;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.User;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.service.MemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;

    @Override
    public MemberProfileResponse getMyProfile() {

        // ✅ 1. Lấy username từ JWT (SecurityContext)
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        // ✅ 2. Query User
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + username)
                );

        // ✅ 3. Query Member theo user_id
        Member member = memberRepository.findByUserId(Math.toIntExact(user.getId()))
                .orElseThrow(() ->
                        new RuntimeException("Member profile not found")
                );

        // ✅ 4. Build Response DTO
        return MemberProfileResponse.builder()
                .id(member.getId())

                // User info
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())

                // Member info
                .phone(member.getPhone())
                .cccd(member.getCccd())
                .sex(member.getSex())
                .status(member.getStatus())

                // AI fields
                .height(member.getHeight())
                .weight(member.getWeight())
                .bmi(member.getBmi())

                .goalType(
                        member.getGoalType() != null
                                ? member.getGoalType().name()
                                : null
                )

                .build();
    }
}
