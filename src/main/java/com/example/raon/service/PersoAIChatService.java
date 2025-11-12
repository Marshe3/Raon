package com.example.raon.service;


import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PersoAIChatService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;
    
    @Value("${persoai.default.llm-type}")
    private String defaultLlmType;
    
    @Value("${persoai.default.tts-type}")
    private String defaultTtsType;
    
    @Value("${persoai.default.stt-type}")
    private String defaultSttType;
    
    @Value("${persoai.default.model-style}")
    private String defaultModelStyle;
    
    @Value("${persoai.default.prompt}")
    private String defaultPrompt;
    
    @Value("${persoai.default.document}")
    private String defaultDocument;

    public String createSession() {
        String url = apiServer + "/api/v1/session/";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("PersoLive-APIKey", apiKey);

        // application.properties의 기본값으로 요청 본문 생성
        Map<String, Object> body = new HashMap<>();
        body.put("llm_type", defaultLlmType);
        body.put("tts_type", defaultTtsType);
        body.put("stt_type", defaultSttType);
        body.put("model_style", defaultModelStyle);
        body.put("prompt", defaultPrompt);
        body.put("document", defaultDocument);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        log.debug("Creating session with request: {}", request);

        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        if (response != null && response.containsKey("session_id")) {
            String sessionId = (String) response.get("session_id");
            startSession(sessionId); // 세션 생성 후 바로 시작
            return sessionId;
        }

        throw new RuntimeException("Failed to create PersoAI session");
    }

    private void startSession(String sessionId) {
        String url = String.format("%s/api/v1/session/%s/event/create/", apiServer, sessionId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("PersoLive-APIKey", apiKey);

        Map<String, String> body = new HashMap<>();
        body.put("event", "SESSION_START");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        restTemplate.postForObject(url, request, Map.class);
        log.info("PersoAI session started: {}", sessionId);
    }
}