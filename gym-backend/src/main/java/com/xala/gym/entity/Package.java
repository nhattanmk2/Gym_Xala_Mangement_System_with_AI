package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;

    // Số buổi tập tối đa của gói
    private Integer maxSessions;

    // Thời hạn gói (ngày)
    private Integer durationInDays;

    // Loại gói (VD: "CARDIO", "MUSCLE") -> AI sẽ dựa vào đây để map với GoalType
    private String category;
    
    // Trạng thái (Đang kinh doanh hay ngừng)
    private Boolean active = true;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] image;

    @Column(columnDefinition = "TEXT")
    private String promotion;

    @ManyToMany
    @JoinTable(
            name = "package_pts",
            joinColumns = @JoinColumn(name = "package_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private java.util.Set<Employee> personalTrainers = new java.util.HashSet<>();
}