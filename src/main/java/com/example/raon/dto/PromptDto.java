package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Prompt DTO
 * PersoAI API의 Prompt 정보를 담는 데이터 전송 객체
 */
@Data
public class PromptDto {
    private String promptId;
    private String name;
    private String prompt;
    private String introMessage;
    private LocalDateTime createdAt;
}