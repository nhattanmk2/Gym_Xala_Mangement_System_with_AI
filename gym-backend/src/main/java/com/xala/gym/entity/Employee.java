package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "position_id")
    private Position position;

    @ManyToOne
    @JoinColumn(name = "address_gym_id")
    private GymLocation gymLocation;

    private String name;
    private String phone;
//    private String email;
    
    @Column(name = "start_work")
    private LocalDateTime startWork;

    // --- AI FIELDS (Dành cho PT) ---
    @Column(name = "pt_specialty")
    private String ptSpecialty; // Chuyên môn PT

    @Column(name = "pt_rating")
    private Double ptRating; // Đánh giá trung bình
}