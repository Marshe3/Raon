package com.example.raon.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionRequest {
    private String llmType;
    private String ttsType;
    private String sttType;
    private String modelStyle;
    private String prompt;
    private String document;
    private List<String> capability;
    private String agent;
}