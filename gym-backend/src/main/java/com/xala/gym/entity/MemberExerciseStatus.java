package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_exercise_status")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberExerciseStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_card_id", nullable = false)
    private MembershipCard membershipCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private WorkoutExercise exercise;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isCompleted = false;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (isCompleted == null) {
            isCompleted = false;
        }
    }
}
