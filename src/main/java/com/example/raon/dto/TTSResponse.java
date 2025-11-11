package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * TTS Response DTO
 * Text-to-Speech 응답 정보를 담는 데이터 전송 객체
 * 
 * API: POST /api/live_chat/v2/session/{session_id}/tts/
 */
@Data
public class TTSResponse {
    /**
     * 생성된 오디오 파일 URL
     */
    private String audioUrl;
    
    /**
     * 오디오 길이 (초)
     */
    private String duration;
    
    /**
     * 생성 시간
     */
    private LocalDateTime timestamp;
}