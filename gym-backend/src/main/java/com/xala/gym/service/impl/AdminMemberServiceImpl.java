package com.xala.gym.service.impl;

import com.xala.gym.dto.request.AdminCreateMemberRequest;
import com.xala.gym.dto.request.AdminUpdateMemberRequest;
import com.xala.gym.dto.response.AdminMemberResponse;
import com.xala.gym.entity.GymLocation;
import com.xala.gym.entity.Role;
import com.xala.gym.entity.User;
import com.xala.gym.entity.Member;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.GymLocationRepository;
import com.xala.gym.repository.MemberRepository;
import com.xala.gym.repository.RoleRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.service.AdminMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class AdminMemberServiceImpl implements AdminMemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final GymLocationRepository gymLocationRepository;

    @Transactional
    public AdminMemberResponse createMember(AdminCreateMemberRequest request) {

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
        user.setFullName(request.getName()); // Đồng bộ tên
        user.setPhone(request.getPhone());   // Đồng bộ SĐT
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

        // 3️⃣ Map sang response
        return AdminMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .cccd(member.getCccd())
                .status(member.getStatus())
                .build();
    }

    // ✅ API Admin lấy danh sách Member
    public List<AdminMemberResponse> getAllMembers(String name, String cccd, String email, String phone, String sex) {

        String searchName = name == null ? "" : name.trim();
        String searchCccd = cccd == null ? "" : cccd.trim();

        List<Member> members = memberRepository.searchMembers(searchName, searchCccd);

        return members.stream()
                .map(m -> AdminMemberResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .cccd(m.getCccd())
                        .email(m.getEmail())
                        .phone(m.getPhone())
                        .sex(m.getSex())
                        .status(m.getStatus())
                        .build())
                .toList();
    }

    @Transactional
    public void updateMemberStatus(Integer memberId, boolean status) {

        // 1️⃣ Tìm Member
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy học viên"));

        // 2️⃣ Cập nhật status Member
        member.setStatus(status);

        // 3️⃣ Đồng bộ User.enabled
        User user = member.getUser();
        user.setEnabled(status);

        // 4️⃣ Lưu (cascade không dùng ở đây nên save cả 2 cho chắc chắn)
        memberRepository.save(member);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public AdminMemberResponse updateMember(
            Integer memberId,
            AdminUpdateMemberRequest request
    ) {

        // 1️⃣ Tìm Member
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy học viên"));

        User user = member.getUser();

        // 1.5️⃣ Update new fields
        if (request.getName() != null && !request.getName().isBlank()) {
            member.setName(request.getName());
            user.setFullName(request.getName()); // Đồng bộ tên
        }
        if (request.getCccd() != null) {
            member.setCccd(request.getCccd());
        }
        if (request.getSex() != null) {
            member.setSex(request.getSex());
        }

        // 2️⃣ Update Email (nếu có)
        if (request.getEmail() != null && !request.getEmail().isBlank()) {

            // check email trùng
            userRepository.findByEmail(request.getEmail())
                    .filter(u -> !u.getId().equals(user.getId()))
                    .ifPresent(u -> {
                        throw new RuntimeException("Email đã tồn tại");
                    });

            member.setEmail(request.getEmail());
            user.setEmail(request.getEmail());
        }

        // 3️⃣ Update Phone
        if (request.getPhone() != null) {
            member.setPhone(request.getPhone());
            user.setPhone(request.getPhone()); // Đồng bộ SĐT
        }

        // 4️⃣ Update GymLocation
        if (request.getAddressGymId() != null) {

            GymLocation gymLocation =
                    gymLocationRepository.findById(request.getAddressGymId())
                            .orElseThrow(() ->
                                    new RuntimeException("Địa điểm gym không tồn tại"));

            member.setGymLocation(gymLocation);
        }

        // 5️⃣ Save
        memberRepository.save(member);
        userRepository.save(user);

        // 6️⃣ Return response
        return AdminMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .cccd(member.getCccd())
                .email(member.getEmail())
                .phone(member.getPhone())
                .sex(member.getSex())
                .status(member.getStatus())
                .build();
    }

    @Override
    @Transactional
    public void deleteMember(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        User user = member.getUser();

        // Xóa member
        memberRepository.delete(member);

        // Xóa user
        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Override
    @Transactional
    public void upgradeToPt(Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        User user = member.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for this member");
        }

        Role ptRole = roleRepository.findByName(com.xala.gym.entity.enums.UserRole.ROLE_PT)
                .orElseThrow(() -> new RuntimeException("ROLE_PT not found"));
        Role memberRole = roleRepository.findByName(com.xala.gym.entity.enums.UserRole.ROLE_MEMBER)
                .orElseThrow(() -> new RuntimeException("ROLE_MEMBER not found"));

        user.getRoles().remove(memberRole);
        user.getRoles().add(ptRole);

        userRepository.save(user);
    }
}
