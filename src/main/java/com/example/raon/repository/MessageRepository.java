package com.example.raon.repository;

import com.example.raon.domain.ChatRoom;
import com.example.raon.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
    
    List<Message> findByChatRoom_IdOrderByCreatedAtAsc(Long chatId);

    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :chatId ORDER BY m.createdAt DESC")
    List<Message> findRecentMessagesByChatId(Long chatId);
    
    // 특정 역할의 메시지만 조회
    List<Message> findByChatRoomAndRole(ChatRoom chatRoom, String role);
    
    // 특정 시간 이후의 메시지 조회
    List<Message> findByChatRoomAndCreatedAtAfter(ChatRoom chatRoom, LocalDateTime after);
    
    // 채팅방별 메시지 수 조회
    long countByChatRoom(ChatRoom chatRoom);
    
    // 오래된 메시지 삭제용
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
    
    // 마지막 메시지 조회
    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :chatId ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessageByChatId(Long chatId);
}