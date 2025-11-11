package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * STT Response DTO
 * Speech-to-Text 응답 정보를 담는 데이터 전송 객체
 * 
 * API: POST /api/live_chat/v2/session/{session_id}/stt/
 */
@Data
public class STTResponse {
    /**
     * 인식된 텍스트
     */
    private String text;
    
    /**
     * 인식 신뢰도 (0.0 ~ 1.0)
     */
    private Double confidence;
    
    /**
     * 인식 시간
     */
    private LocalDateTime timestamp;
}