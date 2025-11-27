package com.example.raon.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chatbot")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Chatbot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatbot_id")
    private Long id;

    @Column(name = "chatbot_name", nullable = false)
    private String chatbotName;

    @Column(name = "description")
    private String description;

    @Column(name = "model_style")
    private String modelStyle;

    @Column(name = "tts_type")
    private String ttsType;

    @Column(name = "llm_type")
    private String llmType;

    @Column(name = "stt_type")
    private String sttType;

    @Column(name = "prompt_id")
    private String promptId;

    @Column(name = "document_id")
    private String documentId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @OneToMany(mappedBy = "chatbot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatbotMcpServer> mcpServers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addMcpServer(ChatbotMcpServer mcpServer) {
        mcpServers.add(mcpServer);
        mcpServer.setChatbot(this);
    }

    public void clearMcpServers() {
        mcpServers.clear();
    }
}
