package com.example.raon.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class STTResponse {
    private String recognizedText;
    private boolean success;
    private String error;
}