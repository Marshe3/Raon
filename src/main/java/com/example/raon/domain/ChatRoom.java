package com.example.raon.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_room", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_chatbot_id", columnList = "chatbot_id"),
    @Index(name = "idx_persoai_session_id", columnList = "persoai_session_id")
})
@Data
@ToString(exclude = {"user", "chatbot", "messages"})
@EqualsAndHashCode(exclude = {"user", "chatbot", "messages"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Long chatId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatbot_id")
    private Chatbot chatbot;
    
    @Column(name = "chat_title", length = 200, nullable = false)
    private String chatTitle;
    
    // PersoAI 세션 정보
    @Column(name = "persoai_session_id", unique = true)
    private String persoaiSessionId;
    
    @Column(name = "session_status", length = 50)
    private String sessionStatus;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();
    
    // 비즈니스 메서드
    public void addMessage(Message message) {
        messages.add(message);
        message.setChatRoom(this);
        this.lastMessageAt = LocalDateTime.now();
    }
    
    public void startSession(String persoaiSessionId) {
        this.persoaiSessionId = persoaiSessionId;
        this.sessionStatus = "IN_PROGRESS";
        this.startedAt = LocalDateTime.now();
    }
    
    public void endSession() {
        this.sessionStatus = "TERMINATED";
        this.endedAt = LocalDateTime.now();
    }
    
    public void updateTitle(String title) {
        this.chatTitle = title;
    }
}