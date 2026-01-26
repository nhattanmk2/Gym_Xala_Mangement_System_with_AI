package com.xala.gym.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "`position`") // Lưu ý dấu ` ` vì position là từ khóa SQL
@Data
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "position_id")
    private Integer id;

    @Column(nullable = false)
    private String name;
}