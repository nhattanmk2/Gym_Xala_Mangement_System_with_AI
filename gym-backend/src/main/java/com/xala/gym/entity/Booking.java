package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pt_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người đặt (Member) - Có thể null nếu là khung giờ rảnh PT tự đăng ký
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = true)
    private User member;

    // PT được chọn (Nếu có)
    @ManyToOne
    @JoinColumn(name = "pt_id")
    private User personalTrainer;

    // Gói tập đã đăng ký - Có thể null khi PT đăng ký giờ rảnh
    @ManyToOne
    @JoinColumn(name = "package_id", nullable = true)
    private Package gymPackage;

    @Column(name = "booking_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Trạng thái: PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String status;

    // Dữ liệu cho AI học (Feedback loop)
    // Sau khi tập, member đánh giá -> AI cập nhật trọng số cho PT này
    private Integer rating; // 1-5
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
}