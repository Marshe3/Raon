package com.example.raon.dto.chat;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "persoai")
public class PersoAIProperties {
    
    private Api api = new Api();
    private Default defaults = new Default();
    private Session session = new Session();
    
    @Data
    public static class Api {
        private String server;
        private String key;
    }
    
    @Data
    public static class Default {
        private String llmType;
        private String ttsType;
        private String sttType;
        private String modelStyle;
        private String prompt;
        private String document;
    }
    
    @Data
    public static class Session {
        private Integer timeout;
    }
}