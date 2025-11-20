package com.example.raon.controller;

import com.example.raon.domain.ChatRoom;
import com.example.raon.dto.MessageDto;
import com.example.raon.repository.ChatRoomRepository;
import com.example.raon.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/chatrooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;

    /**
     * chatRoomId로 메시지 조회 (자동 재연결 시 이전 대화 복원용)
     */
    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<?> getMessagesByChatRoomId(@PathVariable Long chatRoomId) {
        try {
            log.info("📜 채팅방 메시지 조회 요청: chatRoomId={}", chatRoomId);

            ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomId));

            List<MessageDto> messages = messageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom)
                    .stream()
                    .map(MessageDto::from)
                    .collect(Collectors.toList());

            log.info("✅ 채팅방 메시지 조회 성공: chatRoomId={}, count={}", chatRoomId, messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("❌ 채팅방 메시지 조회 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "채팅방 메시지 조회 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
}
