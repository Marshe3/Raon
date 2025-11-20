// src/main/java/com/example/raon/controller/SessionController.java
package com.example.raon.controller;

import com.example.raon.domain.ChatRoom;
import com.example.raon.dto.MessageDto;
import com.example.raon.dto.MessageSaveRequest;
import com.example.raon.dto.SessionCreateRequest;
import com.example.raon.dto.SessionResponse;
import com.example.raon.service.ChatRoomService;
import com.example.raon.service.PersoAISessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final PersoAISessionService sessionService;
    private final ChatRoomService chatRoomService;

    @PostMapping(
        value = "/create",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> createSession(@RequestBody SessionCreateRequest request) {
        try {
            log.info("🚀 세션 생성 요청: {}", request);

            // 이전 채팅방 ID가 있으면 컨텍스트 생성
            if (request.getPreviousChatRoomId() != null) {
                String previousContext = chatRoomService.buildContextFromPreviousChatRoom(
                        request.getPreviousChatRoomId(), 10); // 최근 10개 메시지

                if (previousContext != null) {
                    // extraData에 컨텍스트 추가
                    Map<String, Object> extraData = request.getExtraData();
                    if (extraData == null) {
                        extraData = new HashMap<>();
                        request.setExtraData(extraData);
                    }
                    extraData.put("previous_context", previousContext);
                    log.info("📝 이전 대화 컨텍스트 추가: chatRoomId={}", request.getPreviousChatRoomId());
                }
            }

            SessionResponse response = sessionService.createSession(request);
            log.info("✅ 세션 생성 성공: {}", response.getSessionId());

            // 채팅방 생성 또는 재사용
            ChatRoom chatRoom;
            if (request.getPreviousChatRoomId() != null) {
                // 자동 재연결: 기존 채팅방 재사용
                chatRoom = chatRoomService.getChatRoomById(request.getPreviousChatRoomId());
                chatRoom.updateSessionId(response.getSessionId());
                chatRoomService.saveChatRoom(chatRoom);
                log.info("✅ 기존 채팅방 재사용: chatRoomId={}, newSessionId={}",
                        chatRoom.getId(), response.getSessionId());
            } else {
                // 최초 세션 생성: 새 채팅방 생성
                chatRoom = chatRoomService.getOrCreateChatRoom(response.getSessionId());
                log.info("✅ 새 채팅방 생성: chatRoomId={}", chatRoom.getId());
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", response.getSessionId());
            responseData.put("chatRoomId", chatRoom.getId());

            if (response.getSdp() != null) {
                responseData.put("sdp", response.getSdp());
            }
            if (response.getIceServers() != null) {
                responseData.put("iceServers", response.getIceServers());
            }

            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            log.error("❌ 세션 생성 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 생성 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        try {
            log.info("🔍 세션 조회 요청: {}", sessionId);
            SessionResponse response = sessionService.getSession(sessionId);
            log.info("✅ 세션 조회 성공: {}", sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 세션 조회 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 조회 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<?> saveMessage(
            @PathVariable String sessionId,
            @RequestBody MessageSaveRequest request) {
        try {
            log.info("💬 메시지 저장 요청: sessionId={}, role={}", sessionId, request.getRole());
            MessageDto message = chatRoomService.saveMessage(sessionId, request);
            log.info("✅ 메시지 저장 성공: messageId={}", message.getMessageId());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("❌ 메시지 저장 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "메시지 저장 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String sessionId) {
        try {
            log.info("📜 메시지 조회 요청: sessionId={}", sessionId);
            List<MessageDto> messages = chatRoomService.getMessages(sessionId);
            log.info("✅ 메시지 조회 성공: sessionId={}, count={}", sessionId, messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("❌ 메시지 조회 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "메시지 조회 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/{sessionId}/messages")
    public ResponseEntity<?> clearMessages(@PathVariable String sessionId) {
        try {
            log.info("🗑️ 메시지 삭제 요청: sessionId={}", sessionId);
            chatRoomService.clearMessages(sessionId);
            log.info("✅ 메시지 삭제 성공: sessionId={}", sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ 메시지 삭제 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "메시지 삭제 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<?> cleanupAllSessions() {
        try {
            log.info("🧹 모든 활성 세션 정리 요청");
            int deletedCount = sessionService.cleanupAllSessions();
            log.info("✅ 세션 정리 완료: {} 개 삭제", deletedCount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deletedCount", deletedCount);
            response.put("message", deletedCount + "개의 세션이 정리되었습니다");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 세션 정리 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 정리 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
