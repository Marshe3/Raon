package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Exchange Response DTO
 * 메시지 교환 응답 정보를 담는 데이터 전송 객체
 * 
 * API: POST /api/live_chat/v2/session/{session_id}/exchange/
 */
@Data
public class ExchangeResponse {
    /**
     * 세션 ID
     */
    private String sessionId;
    
    /**
     * AI의 응답 메시지
     */
    private String response;
    
    /**
     * 응답 시간
     */
    private LocalDateTime timestamp;
}