package com.example.raon.controller;

import com.example.raon.domain.Chatbot;
import com.example.raon.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatbots")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;

    /**
     * 챗봇 상세 정보 조회
     * GET /api/chatbots/{chatbotId}
     */
    @GetMapping("/{chatbotId}")
    public ResponseEntity<Chatbot> getChatbot(@PathVariable Long chatbotId) {
        log.info("GET /api/chatbots/{} - 챗봇 정보 조회 요청", chatbotId);
        Chatbot chatbot = chatbotService.getChatbotById(chatbotId);
        return ResponseEntity.ok(chatbot);
    }

    /**
     * 활성화된 챗봇 목록 조회
     * GET /api/chatbots
     */
    @GetMapping
    public ResponseEntity<List<Chatbot>> getAllActiveChatbots() {
        log.info("GET /api/chatbots - 활성화된 챗봇 목록 조회 요청");
        List<Chatbot> chatbots = chatbotService.getAllActiveChatbots();
        return ResponseEntity.ok(chatbots);
    }

    /**
     * 공개 챗봇 목록 조회
     * GET /api/chatbots/public
     */
    @GetMapping("/public")
    public ResponseEntity<List<Chatbot>> getPublicChatbots() {
        log.info("GET /api/chatbots/public - 공개 챗봇 목록 조회 요청");
        List<Chatbot> chatbots = chatbotService.getPublicChatbots();
        log.info("공개 챗봇 {} 개 조회됨", chatbots.size());
        return ResponseEntity.ok(chatbots);
    }
}
