package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<String> capabilities;  // WebRTC 지원 여부 확인을 위한 capability 목록
}