package com.xala.gym.service;

import com.xala.gym.dto.request.LoginRequest;
import com.xala.gym.dto.request.RegisterRequest;
import com.xala.gym.entity.Role;
import com.xala.gym.entity.User;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.RoleRepository;
import com.xala.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    public User register(RegisterRequest request) {
        // Kiểm tra username tồn tại
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Lỗi: Username đã tồn tại!");
        }

        // Kiểm tra email tồn tại (Giờ đã hoạt động vì đã thêm vào UserRepository)
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Lỗi: Email đã được sử dụng!");
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(request.getPassword()); // Lưu ý: Nên mã hóa password (BCrypt)
        newUser.setEmail(request.getEmail());
        newUser.setFullName(request.getFullName());
        newUser.setPhone(request.getPhone());

        // --- Dữ liệu AI ---
        newUser.setHeight(request.getHeight());
        newUser.setWeight(request.getWeight());
        newUser.setGoalType(request.getGoalType());

        // Xử lý availabilitySlots
        // Vì Entity User sử dụng StringListConverter nên có thể nhận trực tiếp List<String>
        if (request.getAvailabilitySlots() != null && !request.getAvailabilitySlots().isEmpty()) {
            newUser.setAvailabilitySlots(request.getAvailabilitySlots());
        }

        newUser.setPtSpecialty(request.getPtSpecialty());

        // --- Role ---
        Set<Role> roles = new HashSet<>();
        String strRole = request.getRole();
        UserRole roleEnum = UserRole.ROLE_MEMBER; // Mặc định là Member

        if (strRole != null) {
            if ("admin".equalsIgnoreCase(strRole)) {
                roleEnum = UserRole.ROLE_ADMIN;
            } else if ("pt".equalsIgnoreCase(strRole)) {
                roleEnum = UserRole.ROLE_PT;
            }
        }

        UserRole finalRoleEnum = roleEnum;
        Role userRole = roleRepository.findByName(roleEnum)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(finalRoleEnum);
                    return roleRepository.save(newRole);
                });

        roles.add(userRole);
        newUser.setRoles(roles);

        return userRepository.save(newUser);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài khoản!"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Lỗi: Sai mật khẩu!");
        }
        return user;
    }
}