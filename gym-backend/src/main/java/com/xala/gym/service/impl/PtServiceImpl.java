package com.xala.gym.service.impl;

import com.xala.gym.dto.request.AdminUpdatePtRequest;
import com.xala.gym.dto.response.AdminPtResponse;
import com.xala.gym.entity.Employee;
import com.xala.gym.entity.enums.UserRole;
import com.xala.gym.entity.GymLocation;
import com.xala.gym.entity.Position;
import com.xala.gym.entity.User;
import com.xala.gym.repository.EmployeeRepository;
import com.xala.gym.repository.GymLocationRepository;
import com.xala.gym.repository.PositionRepository;
import com.xala.gym.repository.UserRepository;
import com.xala.gym.service.PtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PtServiceImpl implements PtService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PositionRepository positionRepository;
    private final GymLocationRepository gymLocationRepository;

    @Override
    public AdminPtResponse getMyProfile() {
        User user = getCurrentUser();
        return mapToAdminPtResponse(user);
    }

    @Override
    @Transactional
    public AdminPtResponse updateMyProfile(AdminUpdatePtRequest request, byte[] avatarFile) {
        User user = getCurrentUser();
        
        // Update User info
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getPtSpecialty() != null) user.setPtSpecialty(request.getPtSpecialty());
        userRepository.save(user);

        // Update Employee info
        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    Employee e = new Employee();
                    e.setUser(user);
                    return e;
                });
        
        if (request.getFullName() != null) employee.setName(request.getFullName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getPtSpecialty() != null) employee.setPtSpecialty(request.getPtSpecialty());
        if (request.getPtExperience() != null) employee.setPtExperience(request.getPtExperience());
        if (request.getPtBio() != null) employee.setPtBio(request.getPtBio());

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

        return mapToAdminPtResponse(user);
    }

    @Override
    public List<Position> getAllPositions() {
        return positionRepository.findAll();
    }

    @Override
    public List<GymLocation> getAllLocations() {
        return gymLocationRepository.findAll();
    }

    @Override
    public List<AdminPtResponse> getAllPts(Integer branchId) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_PT))
                .map(this::mapToAdminPtResponse)
                .filter(resp -> branchId == null || branchId.equals(resp.getGymLocationId()))
                .collect(java.util.stream.Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private AdminPtResponse mapToAdminPtResponse(User u) {
        AdminPtResponse resp = AdminPtResponse.builder()
                .id(u.getId())
                .name(u.getFullName())
                .username(u.getUsername())
                .email(u.getEmail())
                .phone(u.getPhone())
                .ptSpecialty(u.getPtSpecialty())
                .ptRating(u.getAverageRating())
                .status(u.getEnabled())
                .build();

        employeeRepository.findByUser_Id(u.getId()).ifPresent(e -> {
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
            resp.setPtExperience(e.getPtExperience());
            resp.setPtBio(e.getPtBio());
        });

        return resp;
    }
}
