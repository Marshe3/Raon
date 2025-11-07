package com.example.raon.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "message", indexes = {
    @Index(name = "idx_chat_id", columnList = "chat_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@ToString(exclude = "chatRoom")
@EqualsAndHashCode(exclude = "chatRoom")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private ChatRoom chatRoom;
    
    @Column(name = "role", length = 20, nullable = false)
    private String role;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // 편의 메서드
    public static Message createUserMessage(String content) {
        return Message.builder()
                .role("user")
                .content(content)
                .build();
    }
    
    public static Message createAssistantMessage(String content) {
        return Message.builder()
                .role("assistant")
                .content(content)
                .build();
    }
    
    public static Message createSystemMessage(String content) {
        return Message.builder()
                .role("system")
                .content(content)
                .build();
    }
}