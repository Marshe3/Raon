package com.example.raon.dto.chat;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionResponse {
    private String sessionId;
    private LocalDateTime createdAt;
    private String status;
    private String llmType;
    private String ttsType;
    private String modelStyle;
}