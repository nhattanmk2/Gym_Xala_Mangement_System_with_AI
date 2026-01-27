package com.xala.gym.service;

import com.xala.gym.dto.request.LoginRequest;
import com.xala.gym.dto.request.RegisterRequest;
import com.xala.gym.entity.Role;
import com.xala.gym.entity.User;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.RoleRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ======================= REGISTER =======================
    public User register(RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // ✅ BCrypt
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        // ===== ROLE =====
        UserRole roleEnum = UserRole.ROLE_MEMBER;
        if ("admin".equalsIgnoreCase(request.getRole())) {
            roleEnum = UserRole.ROLE_ADMIN;
        } else if ("pt".equalsIgnoreCase(request.getRole())) {
            roleEnum = UserRole.ROLE_PT;
        }

        UserRole finalRoleEnum = roleEnum;
        Role role = roleRepository.findByName(roleEnum)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(finalRoleEnum);
                    return roleRepository.save(r);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    // ======================= LOGIN =======================
    public String login(LoginRequest request) {

        // 1️⃣ Xác thực qua Spring Security
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getUsername(),
                                request.getPassword()
                        )
                );

        // 2️⃣ LẤY UserDetails (DÒNG BẠN BỊ THIẾU)
        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        // 3️⃣ Tạo JWT
        return jwtService.generateToken(userDetails);
    }
}
