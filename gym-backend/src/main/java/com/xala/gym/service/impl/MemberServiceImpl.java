package com.xala.gym.service.impl;

import com.xala.gym.dto.response.MemberProfileResponse;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.User;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.service.MemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

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
        Member member = memberRepository.findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Member profile not found")
                );

        // ✅ 4. Trả avatar về dạng base64
        String avatarBase64 = null;

        if (member.getAvatar() != null) {
            avatarBase64 = Base64.getEncoder().encodeToString(member.getAvatar());
        }

        // ✅ 5. Build Response DTO
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

                .avatarBase64(avatarBase64)

                .build();
    }

    @Override
    public void updateAvatar(MultipartFile file) {

        try {
            /// ✅ Lấy username từ JWT SecurityContext
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            // ✅ Tìm Member theo UserId
            Member member = memberRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Member"));

            // ✅ Convert file -> byte[]
            member.setAvatar(file.getBytes());

            // ✅ Save DB
            memberRepository.save(member);

        } catch (Exception e) {
            throw new RuntimeException("Upload avatar thất bại: " + e.getMessage());
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void updateMyProfile(com.xala.gym.dto.request.UserUpdateProfileRequest request) {
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
        Member member = memberRepository.findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Member profile not found")
                );

        // ✅ 4. Cập nhật thông tin
        user.setFullName(request.getFullName());
        
        member.setPhone(request.getPhone());
        member.setCccd(request.getCccd());
        member.setSex(request.getSex());

        // ✅ 5. Lưu DB
        userRepository.save(user);
        memberRepository.save(member);
    }
}
