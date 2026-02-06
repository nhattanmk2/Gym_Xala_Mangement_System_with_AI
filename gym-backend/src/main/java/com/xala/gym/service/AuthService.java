package com.xala.gym.service;

import com.xala.gym.dto.request.LoginRequest;
import com.xala.gym.dto.request.RegisterRequest;
import com.xala.gym.dto.request.VerifyRequest;
import com.xala.gym.dto.response.AuthResponse;
import com.xala.gym.entity.Role;
import com.xala.gym.entity.User;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.RoleRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ======================= REGISTER MEMBER =======================
    public User registerMember(RegisterRequest request) {

        // 1️⃣ Check username
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }

        // 2️⃣ Check email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // 3️⃣ Lấy ROLE_MEMBER (bắt buộc phải tồn tại)
        Role memberRole = roleRepository
                .findByName(UserRole.ROLE_MEMBER)
                .orElseThrow(() ->
                        new RuntimeException("ROLE_MEMBER chưa tồn tại")
                );

        // 4️⃣ Tạo User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        // ===== VERIFICATION CODE =====
        int verificationCode = 100000 + new Random().nextInt(900000); // 6 chữ số
        user.setVerificationCode(verificationCode);
        user.setEnabled(false);

        log.info("VERIFY CODE | username={} | code={}",
                user.getUsername(),
                verificationCode);

        // ===== AI FIELDS =====
        user.setHeight(request.getHeight());
        user.setWeight(request.getWeight());
        user.setGoalType(request.getGoalType());
        user.setAvailabilitySlots(request.getAvailabilitySlots());

        // ===== FIXED ROLE =====
        user.getRoles().add(memberRole);

        return userRepository.save(user);
    }


    public void verifyAccount(VerifyRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (user.getEnabled()) {
            throw new RuntimeException("Tài khoản đã được kích hoạt");
        }

        if (!user.getVerificationCode().equals(request.getVerificationCode())) {
            throw new RuntimeException("Mã xác thực không đúng");
        }

        // ✅ Kích hoạt tài khoản
        user.setEnabled(true);
        user.setVerificationCode(null);

        userRepository.save(user);
    }

    // ======================= LOGIN =======================
    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getUsername(),
                                request.getPassword()
                        )
                );

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        User user = userRepository
                .findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEnabled()) {
            throw new RuntimeException("Tài khoản chưa được xác thực");
        }

        List<String> roles = user.getRoles()
                .stream()
                .map(r -> r.getName().name())
                .toList();

        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                roles
        );
    }
}

