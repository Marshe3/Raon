package com.example.raon.dto;

import lombok.Data;
import java.util.List;

/**
 * Configuration Bundle DTO
 * 모든 설정 정보를 하나로 묶은 데이터 전송 객체
 * 
 * 백오피스에서 한 번에 모든 설정을 로드할 때 사용
 */
@Data
public class ConfigurationBundle {
    /**
     * 프롬프트 목록
     */
    private List<PromptDto> prompts;
    
    /**
     * 문서 목록
     */
    private List<DocumentDto> documents;
    
    /**
     * 배경 이미지 목록
     */
    private List<BackgroundImageDto> backgroundImages;
    
    /**
     * 모델 스타일 목록
     */
    private List<ModelStyleDto> modelStyles;
    
    /**
     * LLM 모델 목록
     */
    private List<AIModelDto> llmModels;
    
    /**
     * TTS 모델 목록
     */
    private List<AIModelDto> ttsModels;
    
    /**
     * STT 모델 목록
     */
    private List<AIModelDto> sttModels;
}