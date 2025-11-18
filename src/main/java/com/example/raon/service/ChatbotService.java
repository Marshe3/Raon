package com.example.raon.service;

import com.example.raon.domain.Chatbot;
import com.example.raon.repository.ChatbotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatbotService {

    private final ChatbotRepository chatbotRepository;

    /**
     * 챗봇 ID로 조회
     */
    public Chatbot getChatbotById(Long chatbotId) {
        log.info("챗봇 조회 - ID: {}", chatbotId);
        return chatbotRepository.findByIdAndIsActiveTrue(chatbotId)
                .orElseThrow(() -> new IllegalArgumentException("챗봇을 찾을 수 없습니다. ID: " + chatbotId));
    }

    /**
     * 모든 활성화된 챗봇 조회
     */
    public List<Chatbot> getAllActiveChatbots() {
        log.info("활성화된 챗봇 목록 조회");
        return chatbotRepository.findByIsActiveTrue();
    }

    /**
     * 공개된 챗봇 목록 조회
     */
    public List<Chatbot> getPublicChatbots() {
        log.info("공개 챗봇 목록 조회");
        return chatbotRepository.findByIsActiveTrueAndIsPublicTrue();
    }
}
