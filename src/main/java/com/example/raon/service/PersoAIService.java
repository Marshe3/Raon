package com.example.raon.service;

import com.example.raon.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/**
 * PersoAI Service 인터페이스
 * PersoAI Platform API와의 통합을 위한 서비스 계층
 */
public interface PersoAIService {
    
    // ==================== 설정 관리 ====================
    
    /**
     * 모든 Prompt 조회
     * @return Prompt 목록
     */
    List<PromptDto> getAllPrompts();
    
    /**
     * 모든 Document 조회
     * @return Document 목록
     */
    List<DocumentDto> getAllDocuments();
    
    /**
     * 모든 Background Image 조회
     * @return Background Image 목록
     */
    List<BackgroundImageDto> getAllBackgroundImages();
    
    /**
     * 모든 Model Style 조회
     * @return Model Style 목록
     */
    List<ModelStyleDto> getAllModelStyles();
    
    /**
     * 모든 AI 모델 조회 (LLM, TTS, STT)
     * @return AI 모델 목록
     */
    List<AIModelDto> getAllModels();
    
    /**
     * 전체 설정을 한 번에 로드 (캐싱 적용)
     * @return 모든 설정이 포함된 ConfigurationBundle
     */
    ConfigurationBundle loadAllConfigurations();
    
    // ==================== 세션 관리 ====================
    
    /**
     * 채팅 세션 생성
     * @param request 세션 생성 요청 정보
     * @return 생성된 세션 정보
     */
    SessionDto createSession(SessionCreateRequest request);
    
    /**
     * 세션 정보 조회
     * @param sessionId PersoAI 세션 ID
     * @return 세션 정보
     */
    SessionDto getSession(String sessionId);
    
    /**
     * 세션 종료
     * @param sessionId PersoAI 세션 ID
     */
    void terminateSession(String sessionId);
    
    // ==================== 메시지 교환 ====================
    
    /**
     * 메시지 전송 및 응답 받기
     * @param sessionId PersoAI 세션 ID
     * @param message 전송할 메시지
     * @return AI 응답
     */
    ExchangeResponse sendMessage(String sessionId, String message);
    
    // ==================== 음성 처리 ====================
    
    /**
     * Text-to-Speech 변환
     * @param sessionId PersoAI 세션 ID
     * @param text 변환할 텍스트
     * @return TTS 결과 (오디오 URL)
     */
    TTSResponse textToSpeech(String sessionId, String text);
    
    /**
     * Speech-to-Text 변환
     * @param sessionId PersoAI 세션 ID
     * @param audioFile 음성 파일
     * @return STT 결과 (인식된 텍스트)
     */
    STTResponse speechToText(String sessionId, MultipartFile audioFile);
}
