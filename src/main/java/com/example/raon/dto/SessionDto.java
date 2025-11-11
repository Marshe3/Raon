package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Session DTO
 * 채팅 세션 정보를 담는 데이터 전송 객체
 */
@Data
public class SessionDto {
    /**
     * PersoAI 세션 ID
     */
    private String sessionId;
    
    /**
     * 세션 상태: "ACTIVE", "COMPLETED", "ERROR"
     */
    private String status;
    
    /**
     * 세션 생성 시간
     */
    private LocalDateTime createdAt;
}