package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người đặt (Member)
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    // PT được chọn (Nếu có)
    @ManyToOne
    @JoinColumn(name = "pt_id")
    private User personalTrainer;

    // Gói tập đã đăng ký
    @ManyToOne
    @JoinColumn(name = "package_id")
    private Package gymPackage;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Trạng thái: PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String status;

    // Dữ liệu cho AI học (Feedback loop)
    // Sau khi tập, member đánh giá -> AI cập nhật trọng số cho PT này
    private Integer rating; // 1-5
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
}