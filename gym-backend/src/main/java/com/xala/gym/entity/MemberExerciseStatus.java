package com.xala.gym.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_exercise_status", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"membership_card_id", "session_exercise_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MemberExerciseStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_card_id", nullable = false)
    private MembershipCard membershipCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_exercise_id", nullable = false)
    private SessionExercise sessionExercise;

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
