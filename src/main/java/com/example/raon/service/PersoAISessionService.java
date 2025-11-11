package com.example.raon.service;

import com.example.raon.dto.SessionCreateRequest;
import com.example.raon.dto.SessionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PersoAISessionService {

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PersoAISessionService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * PersoAI 세션 생성
     * POST /api/live_chat/v2/session/
     */
    public SessionResponse createSession(SessionCreateRequest request) {
        try {
            String url = apiServer + "/api/live_chat/v2/session/";
            
            // 요청 데이터 변환 (PersoAI API 형식에 맞춤)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", request.getPromptId());
            requestBody.put("llm_type", request.getLlmType());
            requestBody.put("tts_type", request.getTtsType());
            
            if (request.getDocumentId() != null) {
                requestBody.put("document", request.getDocumentId());
            }
            if (request.getSttType() != null) {
                requestBody.put("stt_type", request.getSttType());
            }
            if (request.getModelStyle() != null) {
                requestBody.put("model_style", request.getModelStyle());
            }
            if (request.getBackgroundImageId() != null) {
                requestBody.put("background_image", request.getBackgroundImageId());
            }
            
            requestBody.put("agent", request.getAgent());
            requestBody.put("padding_left", request.getPaddingLeft());
            requestBody.put("padding_top", request.getPaddingTop());
            requestBody.put("padding_height", request.getPaddingHeight());
            requestBody.put("capability", request.getCapability());
            
            if (request.getExtraData() != null) {
                requestBody.put("extra_data", request.getExtraData());
            }
            
            // HTTP 요청
            HttpHeaders headers = new HttpHeaders();
            headers.set("PersoLive-APIKey", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(requestBody, headers);
            
            log.info("📤 PersoAI 세션 생성 요청: {}", url);
            log.debug("요청 본문: {}", requestBody);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, httpRequest, String.class
            );
            
            // 응답 파싱
            JsonNode root = objectMapper.readTree(response.getBody());
            
            SessionResponse sessionResponse = new SessionResponse();
            sessionResponse.setSessionId(root.get("session_id").asText());
            
            if (root.has("sdp")) {
                sessionResponse.setSdp(root.get("sdp").asText());
            }
            if (root.has("ice_servers")) {
                sessionResponse.setIceServers(root.get("ice_servers"));
            }
            
            log.info("✅ 세션 생성 완료: {}", sessionResponse.getSessionId());
            return sessionResponse;
            
        } catch (Exception e) {
            log.error("❌ 세션 생성 실패", e);
            throw new RuntimeException("세션 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 세션 조회
     */
    public SessionResponse getSession(String sessionId) {
        try {
            String url = apiServer + "/api/live_chat/v2/session/" + sessionId + "/";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("PersoLive-APIKey", apiKey);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );
            
            JsonNode root = objectMapper.readTree(response.getBody());
            
            SessionResponse sessionResponse = new SessionResponse();
            sessionResponse.setSessionId(root.get("session_id").asText());
            
            return sessionResponse;
            
        } catch (Exception e) {
            log.error("❌ 세션 조회 실패", e);
            throw new RuntimeException("세션 조회 실패: " + e.getMessage(), e);
        }
    }
}