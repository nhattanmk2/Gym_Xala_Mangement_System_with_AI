package com.xala.gym.entity;

import com.xala.gym.entity.enums.GoalType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết 1-1 với User
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "address_gym_id")
    private GymLocation gymLocation;
    
    // Thông tin cá nhân
    @Column(nullable = false)
    private String name;
    
    private String cccd;
    private String email;
    private String phone;
    private String sex;
    private Boolean status;

    // --- AI FIELDS (Dữ liệu đầu vào cho thuật toán) ---
    private Float height; // cm
    private Float weight; // kg
    
    @Column(name = "bmi", insertable = false, updatable = false) 
    private Float bmi; // Cột tính toán tự động (Generated Column)

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type")
    private GoalType goalType; // GIAM_CAN, TANG_CO...

    @Column(name = "availability_slots", columnDefinition = "json")
    private String availabilitySlots; // Lưu JSON lịch rảnh (vd: ["T2_SANG", "T4_CHIEU"])
}