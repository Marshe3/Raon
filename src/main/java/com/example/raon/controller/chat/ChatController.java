package com.example.raon.controller.chat;

import com.example.raon.dto.chat.*;
import com.example.raon.service.PersoAIChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")  // context-path가 /raon이므로 실제 URL: /raon/api/chat
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")  // React 개발 서버
public class ChatController {
    
    private final PersoAIChatService chatService;
    
    /**
     * 새 채팅 세션 생성
     * POST /raon/api/chat/session
     */
    @PostMapping("/session")
    public Mono<ResponseEntity<CreateSessionResponse>> createSession(
            @RequestParam Long userId,
            @RequestParam Long chatbotId,
            @RequestBody CreateSessionRequest request) {
        log.info("Creating session for user: {}, chatbot: {}", userId, chatbotId);
        
        return chatService.createSession(userId, chatbotId, request)
                .flatMap(sessionResponse -> 
                    chatService.startSession(sessionResponse.getSessionId())
                            .then(Mono.just(sessionResponse))
                )
                .map(response -> ResponseEntity.status(HttpStatus.CREATED).body(response))
                .onErrorResume(error -> {
                    log.error("Failed to create session", error);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(null));
                });
    }
    
    /**
     * 채팅 메시지 전송 (스트리밍)
     * POST /raon/api/chat/message
     */
    @PostMapping(value = "/message", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {
        log.info("Sending message to session: {}", request.getSessionId());
        
        return chatService.chatText(request.getSessionId(), request.getMessage())
                .map(sentence -> ServerSentEvent.<String>builder()
                        .data(sentence)
                        .build())
                .onErrorResume(error -> {
                    log.error("Error during chat", error);
                    return Flux.just(ServerSentEvent.<String>builder()
                            .event("error")
                            .data("Error: " + error.getMessage())
                            .build());
                });
    }
    
    /**
     * 채팅 메시지 전송 (일반 응답)
     * POST /raon/api/chat/message/simple
     */
    @PostMapping("/message/simple")
    public Mono<ResponseEntity<ChatMessageResponse>> sendMessageSimple(
            @Valid @RequestBody ChatMessageRequest request) {
        log.info("Sending simple message to session: {}", request.getSessionId());
        
        return chatService.chatText(request.getSessionId(), request.getMessage())
                .collectList()
                .map(sentences -> {
                    String fullMessage = String.join("", sentences);
                    return ResponseEntity.ok(ChatMessageResponse.builder()
                            .message(fullMessage)
                            .role("assistant")
                            .timestamp(LocalDateTime.now())
                            .success(true)
                            .build());
                })
                .onErrorResume(error -> {
                    log.error("Error during chat", error);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(ChatMessageResponse.builder()
                                    .success(false)
                                    .error(error.getMessage())
                                    .timestamp(LocalDateTime.now())
                                    .build()));
                });
    }
    
    /**
     * 채팅 히스토리 조회
     * GET /raon/api/chat/history/{chatId}
     */
    @GetMapping("/history/{chatId}")
    public ResponseEntity<List<ChatHistoryItem>> getChatHistory(
            @PathVariable Long chatId) {
        log.info("Fetching chat history for chatId: {}", chatId);
        
        List<ChatHistoryItem> history = chatService.getChatHistory(chatId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * 사용자의 채팅방 목록 조회
     * GET /raon/api/chat/rooms
     */
    @GetMapping("/rooms")
    public ResponseEntity<?> getUserChatRooms(@RequestParam Long userId) {
        log.info("Fetching chat rooms for user: {}", userId);
        
        var chatRooms = chatService.getUserChatRooms(userId);
        return ResponseEntity.ok(chatRooms);
    }
    
    /**
     * 세션 종료
     * DELETE /raon/api/chat/session/{sessionId}
     */
    @DeleteMapping("/session/{sessionId}")
    public Mono<ResponseEntity<Void>> endSession(@PathVariable String sessionId) {
        log.info("Ending session: {}", sessionId);
        
        return chatService.endSession(sessionId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(error -> {
                    log.error("Failed to end session", error);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }
    
    /**
     * 헬스체크
     * GET /raon/api/chat/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}