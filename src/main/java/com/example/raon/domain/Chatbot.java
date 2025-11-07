package com.example.raon.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chatbot")
@Data
@ToString(exclude = "chatRooms")
@EqualsAndHashCode(exclude = "chatRooms")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chatbot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatbot_id")
    private Long chatbotId;
    
    @Column(name = "chatbot_name", length = 100, nullable = false)
    private String chatbotName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    // PersoAI 설정
    @Column(name = "model_style", columnDefinition = "TEXT")
    private String modelStyle;
    
    @Column(name = "tts_type", columnDefinition = "TEXT")
    private String ttsType;
    
    @Column(name = "llm_type", length = 50)
    private String llmType;
    
    @Column(name = "stt_type", length = 50)
    private String sttType;
    
    @Column(name = "prompt_id", length = 100)
    private String promptId;
    
    @Column(name = "document_id", length = 100)
    private String documentId;  // 중요!
    
    @Column(name = "background_image", columnDefinition = "TEXT")
    private String backgroundImage;
    
    @Column(name = "system_prompt", columnDefinition = "TEXT")
    private String systemPrompt;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "chatbot", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ChatRoom> chatRooms = new ArrayList<>();
}