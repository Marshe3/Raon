package com.example.raon.dto;

import lombok.Data;
import java.util.Map;

/**
 * AI Model DTO
 * PersoAI API의 AI 모델(LLM, TTS, STT) 정보를 담는 데이터 전송 객체
 */
@Data
public class AIModelDto {
    /**
     * 모델 이름
     */
    private String name;
    
    /**
     * 모델 타입: "llm", "tts", "stt"
     */
    private String type;
    
    /**
     * 추가 메타데이터
     */
    private Map<String, Object> metadata;
}