package com.example.raon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SessionCreateRequest {
    @JsonProperty("promptId")
    private String promptId;
    
    @JsonProperty("llmType")
    private String llmType;
    
    @JsonProperty("ttsType")
    private String ttsType;
    
    @JsonProperty("documentId")
    private String documentId;
    
    @JsonProperty("sttType")
    private String sttType;
    
    @JsonProperty("modelStyle")
    private String modelStyle;
    
    @JsonProperty("backgroundImageId")
    private String backgroundImageId;
    
    @JsonProperty("agent")
    private Integer agent;
    
    @JsonProperty("paddingLeft")
    private Double paddingLeft;
    
    @JsonProperty("paddingTop")
    private Double paddingTop;
    
    @JsonProperty("paddingHeight")
    private Double paddingHeight;
    
    @JsonProperty("capability")
    private List<String> capability;
    
    @JsonProperty("extraData")
    private Map<String, Object> extraData;

    @JsonProperty("previousChatRoomId")
    private Long previousChatRoomId;
}