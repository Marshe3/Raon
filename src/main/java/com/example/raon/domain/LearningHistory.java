// src/main/java/com/example/raon/domain/LearningHistory.java
package com.example.raon.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 유저의 기록인지 (User와 연관관계가 있으면 거기에 맞춰 수정)
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int score;

    // 면접이 언제 진행됐는지 (이름은 네 프로젝트에 맞게!)
    @Column(nullable = false)
    private LocalDateTime createdAt;
}
