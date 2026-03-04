package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_consultation_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConsultationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User member;

    private LocalDateTime consultationTime;

    private Double weight;
    private Double height;
    private Integer age;
    private String gender;
    private String goal;

    private Double bmi;
    private String bmiCategory;
    
    @Column(columnDefinition = "TEXT")
    private String advice;

    // Lưu trữ dưới dạng JSON
    @Column(columnDefinition = "LONGTEXT")
    private String recommendationJson;

    @PrePersist
    public void prePersist() {
        if (this.consultationTime == null) {
            this.consultationTime = LocalDateTime.now();
        }
    }
}
