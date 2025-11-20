package com.example.raon.service;

import com.example.raon.domain.ChatRoom;
import com.example.raon.domain.Message;
import com.example.raon.dto.MessageDto;
import com.example.raon.dto.MessageSaveRequest;
import com.example.raon.repository.ChatRoomRepository;
import com.example.raon.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public ChatRoom getOrCreateChatRoom(String persoSessionId) {
        return chatRoomRepository.findByPersoSessionId(persoSessionId)
                .orElseGet(() -> {
                    ChatRoom chatRoom = ChatRoom.builder()
                            .persoSessionId(persoSessionId)
                            .build();
                    log.info("새 채팅방 생성: sessionId={}", persoSessionId);
                    return chatRoomRepository.save(chatRoom);
                });
    }

    @Transactional
    public MessageDto saveMessage(String persoSessionId, MessageSaveRequest request) {
        ChatRoom chatRoom = getOrCreateChatRoom(persoSessionId);

        Message message = Message.builder()
                .chatRoom(chatRoom)
                .role(request.getRole())
                .content(request.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);
        log.info("메시지 저장: sessionId={}, role={}, messageId={}",
                persoSessionId, request.getRole(), savedMessage.getMessageId());

        return MessageDto.from(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(String persoSessionId) {
        return chatRoomRepository.findByPersoSessionId(persoSessionId)
                .map(chatRoom -> messageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom)
                        .stream()
                        .map(MessageDto::from)
                        .collect(Collectors.toList()))
                .orElseGet(() -> {
                    log.info("채팅방 없음: sessionId={}", persoSessionId);
                    return List.of();
                });
    }

    @Transactional
    public void clearMessages(String persoSessionId) {
        chatRoomRepository.findByPersoSessionId(persoSessionId)
                .ifPresent(chatRoom -> {
                    messageRepository.deleteAll(chatRoom.getMessages());
                    log.info("메시지 삭제: sessionId={}", persoSessionId);
                });
    }

    @Transactional(readOnly = true)
    public String buildContextFromPreviousChatRoom(Long chatRoomId, int maxMessages) {
        return chatRoomRepository.findById(chatRoomId)
                .map(chatRoom -> {
                    List<Message> messages = messageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom);

                    // 최근 N개 메시지만 사용 (토큰 제한 고려)
                    int startIndex = Math.max(0, messages.size() - maxMessages);
                    List<Message> recentMessages = messages.subList(startIndex, messages.size());

                    StringBuilder context = new StringBuilder();
                    context.append("이전 대화 요약:\n");

                    for (Message msg : recentMessages) {
                        String roleLabel = "user".equals(msg.getRole()) ? "사용자" : "AI";
                        context.append(roleLabel)
                               .append(": ")
                               .append(msg.getContent())
                               .append("\n");
                    }

                    context.append("\n위 대화를 참고하여 사용자와 자연스럽게 대화를 이어가세요.");

                    log.info("이전 대화 컨텍스트 생성: chatRoomId={}, messageCount={}",
                            chatRoomId, recentMessages.size());

                    return context.toString();
                })
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Long getChatRoomIdBySessionId(String persoSessionId) {
        return chatRoomRepository.findByPersoSessionId(persoSessionId)
                .map(ChatRoom::getId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ChatRoom getChatRoomById(Long chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomId));
    }

    @Transactional
    public ChatRoom saveChatRoom(ChatRoom chatRoom) {
        return chatRoomRepository.save(chatRoom);
    }
}
