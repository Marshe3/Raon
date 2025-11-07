package com.example.raon.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    @NotBlank(message = "Session ID is required")
    private String sessionId;
}