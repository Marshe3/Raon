package com.example.raon.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionStatusResponse {
    private String sessionId;
    private String status;
    private String llmType;
    private String ttsType;
    private String modelStyle;
    private LocalDateTime createdAt;
    private Integer durationSec;
}