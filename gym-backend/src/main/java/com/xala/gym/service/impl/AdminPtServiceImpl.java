package com.xala.gym.service.impl;

import com.xala.gym.dto.request.AdminCreatePtRequest;
import com.xala.gym.dto.request.AdminUpdatePtRequest;
import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.entity.*;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.repository.*;
import com.xala.gym.service.AdminPtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPtServiceImpl implements AdminPtService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MemberRepository memberRepository;
    private final PositionRepository positionRepository;
    private final GymLocationRepository gymLocationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<AdminPtResponse> getAllPts(String name, String phone) {
        String searchName = name == null ? "" : name.trim();
        String searchPhone = phone == null ? "" : phone.trim();

        log.info("Searching PTs in DB with name LIKE '%{}%' and phone LIKE '%{}%'", searchName, searchPhone);
        List<Employee> pts = employeeRepository.searchPTs(searchName, searchPhone);
        
        return pts.stream()
                .map(this::mapToAdminPtResponse)
                .toList();
    }

    private AdminPtResponse mapToAdminPtResponse(Employee e) {
        User u = e.getUser();
        AdminPtResponse resp = AdminPtResponse.builder()
                .id(e.getId())
                .userId(u.getId())
                .name(u.getFullName())
                .username(u.getUsername())
                .email(u.getEmail())
                .phone(u.getPhone())
                .ptSpecialty(u.getPtSpecialty())
                .ptRating(u.getAverageRating())
                .status(u.getEnabled())
                .build();

        if (e.getPosition() != null) {
            resp.setPositionId(e.getPosition().getId());
            resp.setPositionName(e.getPosition().getName());
        }
        if (e.getGymLocation() != null) {
            resp.setGymLocationId(e.getGymLocation().getId());
            resp.setGymLocationName(e.getGymLocation().getName());
        }
        if (e.getAvatar() != null) {
            resp.setAvatar(Base64.getEncoder().encodeToString(e.getAvatar()));
        }

        return resp;
    }

    private AdminPtResponse mapUserToAdminPtResponse(User u) {
        Employee e = employeeRepository.findByUser_Id(u.getId()).orElse(null);
        if (e == null) {
            // Fallback for cases where employee record is missing
            return AdminPtResponse.builder()
                    .userId(u.getId())
                    .name(u.getFullName())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .phone(u.getPhone())
                    .status(u.getEnabled())
                    .build();
        }
        return mapToAdminPtResponse(e);
    }

    @Override
    @Transactional
    public void downgradeToMember(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Huấn luyện viên (Employee)"));
        User user = employee.getUser();

        // 1. Cập nhật quyền ROLE_PT -> ROLE_MEMBER
        Role ptRole = roleRepository.findByName(UserRole.ROLE_PT)
                .orElseThrow(() -> new RuntimeException("ROLE_PT không tồn tại"));
        Role memberRole = roleRepository.findByName(UserRole.ROLE_MEMBER)
                .orElseThrow(() -> new RuntimeException("ROLE_MEMBER không tồn tại"));
        
        user.getRoles().remove(ptRole);
        if (!user.getRoles().contains(memberRole)) {
            user.getRoles().add(memberRole);
        }
        userRepository.save(user);

        // 3. Đảm bảo có bản ghi Member
        Member member = memberRepository.findByUser_Id(user.getId()).orElse(new Member());
        member.setUser(user);
        member.setName(employee.getName());
        member.setPhone(employee.getPhone());
        member.setGymLocation(employee.getGymLocation());
        member.setAvatar(employee.getAvatar());
        member.setEmail(user.getEmail());
        member.setStatus(true);
        memberRepository.save(member);

        // 4. We keep the employee record if it has dependencies
    }

    @Override
    @Transactional
    public void deletePtCompletely(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Huấn luyện viên (Employee)"));
        User user = employee.getUser();

        // 1. Xóa Member liên quan
        memberRepository.findByUser_Id(user.getId()).ifPresent(memberRepository::delete);

        // 2. Xóa Employee
        employeeRepository.delete(employee);

        // 3. Xoá vĩnh viễn user
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public AdminPtResponse createPt(AdminCreatePtRequest request) {
        // 1. Check duplicate username/email
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        // 2. Create User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setPtSpecialty(request.getPtSpecialty());
        user.setEnabled(true);

        // 3. Assign ROLE_PT
        Role ptRole = roleRepository.findByName(UserRole.ROLE_PT)
                .orElseThrow(() -> new RuntimeException("ROLE_PT not found"));
        user.getRoles().add(ptRole);
        user = userRepository.save(user);

        // 4. Create Employee
        Employee employee = new Employee();
        employee.setUser(user);
        employee.setName(request.getFullName());
        employee.setPhone(request.getPhone());
        employee.setPtSpecialty(request.getPtSpecialty());
        
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found"));
            employee.setPosition(position);
        }
        
        if (request.getGymLocationId() != null) {
            GymLocation location = gymLocationRepository.findById(request.getGymLocationId())
                    .orElseThrow(() -> new RuntimeException("Gym Location not found"));
            employee.setGymLocation(location);
        }

        employeeRepository.save(employee);

        return mapToAdminPtResponse(employee);
    }

    @Override
    public AdminPtResponse getPtDetail(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Huấn luyện viên (Employee)"));
        return mapToAdminPtResponse(employee);
    }

    @Override
    @Transactional
    public AdminPtResponse updatePt(Long id, AdminUpdatePtRequest request, byte[] avatarFile) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Huấn luyện viên (Employee)"));
        User user = employee.getUser();

        // Update User info
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setPtSpecialty(request.getPtSpecialty());
        if (request.getStatus() != null) {
            user.setEnabled(request.getStatus());
        }
        userRepository.save(user);

        // Update Employee info
        employee.setName(request.getFullName());
        employee.setPhone(request.getPhone());
        employee.setPtSpecialty(request.getPtSpecialty());

        if (request.getPositionId() != null) {
            Position pos = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Vị trí không tồn tại"));
            employee.setPosition(pos);
        }

        if (request.getGymLocationId() != null) {
            GymLocation loc = gymLocationRepository.findById(request.getGymLocationId())
                    .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));
            employee.setGymLocation(loc);
        }

        if (avatarFile != null && avatarFile.length > 0) {
            employee.setAvatar(avatarFile);
        }

        employeeRepository.save(employee);

        return mapToAdminPtResponse(employee);
    }
}
