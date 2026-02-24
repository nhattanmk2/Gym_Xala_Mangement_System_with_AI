package com.xala.gym.service.impl;

import com.xala.gym.dto.request.AdminCreateMemberRequest;
import com.xala.gym.dto.response.AdminMemberResponse;
import com.xala.gym.entity.Role;
import com.xala.gym.entity.User;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.RoleRepository;
import com.xala.gym.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createMember(AdminCreateMemberRequest request) {

        // 1️⃣ Kiểm tra trùng username/email
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // 2️⃣ Tạo User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setEnabled(true); // Admin tạo thì kích hoạt luôn

        // 3️⃣ Gán ROLE_MEMBER
        Role role = roleRepository.findByName(UserRole.valueOf("ROLE_MEMBER"))
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));

        user.getRoles().add(role);

        userRepository.save(user);

        // 4️⃣ Tạo Member
        Member member = Member.builder()
                .user(user)
                .name(request.getName())
                .cccd(request.getCccd())
                .email(request.getEmail())
                .phone(request.getPhone())
                .sex(request.getSex())
                .status(true)
                .build();

        memberRepository.save(member);
    }

    // ✅ API Admin lấy danh sách Member
    public List<AdminMemberResponse> getAllMembers(String name, String cccd) {

        List<Member> members = memberRepository.searchMembers(name, cccd);

        return members.stream()
                .map(m -> new AdminMemberResponse(
                        m.getId(),
                        m.getName(),
                        m.getCccd(),
                        m.getEmail(),
                        m.getPhone(),
                        m.getStatus()
                ))
                .toList();
    }
}
