// src/main/java/com/example/raon/dto/LearningHistoryResponse.java
package com.example.raon.dto;

import com.example.raon.domain.LearningHistory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class LearningHistoryResponse {

    private Long id;
    private int score;
    private String date; // "2025.11.10"
    private String time; // "14:20"

    public static LearningHistoryResponse from(LearningHistory entity) {
        // ⚠️ 여기서 날짜/시간 필드는 네 엔티티 필드명에 맞게!
        // 예: createdAt, interviewedAt 등
        LocalDateTime dt = entity.getCreatedAt();

        return LearningHistoryResponse.builder()
                .id(entity.getId())
                .score(entity.getScore())
                .date(dt.toLocalDate().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")))
                .time(dt.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .build();
    }
}
