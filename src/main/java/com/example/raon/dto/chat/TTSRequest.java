package com.example.raon.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TTSRequest {
    @NotBlank(message = "Text is required")
    private String text;
    
    @NotBlank(message = "Session ID is required")
    private String sessionId;
}