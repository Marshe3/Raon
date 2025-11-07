package com.example.raon.repository;

import com.example.raon.domain.ChatRoom;
import com.example.raon.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByPersoaiSessionId(String persoaiSessionId);
    
    List<ChatRoom> findByUserOrderByLastMessageAtDesc(UserEntity user);
    
    List<ChatRoom> findByUser_UserIdOrderByLastMessageAtDesc(Long userId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.user.userId = :userId AND cr.sessionStatus = 'IN_PROGRESS'")
    List<ChatRoom> findActiveSessionsByUserId(Long userId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.user.userId = :userId ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findRecentChatRoomsByUserId(Long userId);
    
    // 세션 상태별 조회
    List<ChatRoom> findBySessionStatus(String status);
    
    // 특정 기간 이후 메시지가 없는 방
    List<ChatRoom> findByLastMessageAtBefore(LocalDateTime dateTime);
    
    // 챗봇별 채팅방 조회
    List<ChatRoom> findByChatbot_ChatbotId(Long chatbotId);
}