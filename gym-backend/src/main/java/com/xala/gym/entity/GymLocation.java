package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "gym_location")
@Data
public class GymLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;
}