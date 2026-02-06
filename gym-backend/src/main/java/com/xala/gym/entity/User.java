package com.xala.gym.entity;

import com.xala.gym.entity.enums.GoalType;
import com.xala.gym.utils.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users") // Tránh dùng 'user' vì trùng từ khóa SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    private String fullName;
    private String phone;
    private String address;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // ==========================================
    // CÁC TRƯỜNG DỮ LIỆU PHỤC VỤ AI (AI FIELDS)
    // ==========================================

    // Mục tiêu tập luyện (Quan trọng cho thuật toán gợi ý gói tập)
    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type")
    private GoalType goalType;

    // Chỉ số cơ thể (Dùng để tính BMI -> Gợi ý chế độ tập)
    private Float height; // cm
    private Float weight; // kg

    // Lịch rảnh hoặc lịch dạy (Dùng cho thuật toán Matching)
    // Lưu dạng JSON: ["MON_MORNING", "WED_EVENING"]
    @Convert(converter = StringListConverter.class)
    @Column(name = "availability_slots", columnDefinition = "JSON")
    private List<String> availabilitySlots;

    // --- Dành riêng cho PT ---
    
    // Chuyên môn (VD: "Yoga, HITT") -> Matching với Goal của Member
    @Column(name = "pt_specialty")
    private String ptSpecialty;

    // Đánh giá trung bình (Input cho thuật toán Scoring)
    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "verification_code")
    private Integer verificationCode;

    @Column(nullable = false)
    private Boolean enabled = false;

}