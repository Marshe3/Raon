package com.example.raon.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class STTRequest {
    @NotBlank(message = "Session ID is required")
    private String sessionId;
    
    // Base64 encoded audio data
    @NotBlank(message = "Audio data is required")
    private String audioData;
}