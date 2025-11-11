package com.example.raon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SessionResponse {
    @JsonProperty("sessionId")
    private String sessionId;
    
    @JsonProperty("sdp")
    private String sdp;
    
    @JsonProperty("iceServers")
    private Object iceServers;
    
    // 기타 필드들...
}