package com.example.raon.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PersoAIService {

    private static final Logger logger = LoggerFactory.getLogger(PersoAIService.class);

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public PersoAIService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * PersoAI API로 요청을 프록시하는 메서드
     * @param endpoint API 엔드포인트 경로 (예: /api/v1/settings)
     * @param method HTTP 메서드
     * @param body 요청 본문 (선택적)
     * @return API 응답
     */
    public Object proxyRequest(String endpoint, HttpMethod method, Object body) {
        String url = apiServer + endpoint;

        logger.info("PersoAI API 호출: {} {}", method, url);

        HttpHeaders headers = new HttpHeaders();
        // PersoAI API는 api-key 헤더를 사용
        headers.set("api-key", apiKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<Object> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                url,
                method,
                request,
                Object.class
            );

            logger.info("PersoAI API 응답 성공: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            logger.error("PersoAI API 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("PersoAI API 호출 실패: " + e.getMessage(), e);
        }
    }

    /**
     * PersoAI 설정 정보 가져오기
     * @return 설정 정보
     */
    public Object getAllSettings() {
        return proxyRequest("/api/v1/settings", HttpMethod.GET, null);
    }

    /**
     * PersoAI 세션 ID 생성
     * @param requestBody 세션 생성 요청 데이터
     * @return 세션 ID
     */
    public Object createSessionId(Object requestBody) {
        return proxyRequest("/api/v1/session-id", HttpMethod.POST, requestBody);
    }

    /**
     * API Server 주소 반환 (SDK 연결용)
     * @return API Server URL
     */
    public String getApiServer() {
        return apiServer;
    }

    /**
     * API Server와 함께 config 반환
     * @return API Server와 config 정보
     */
    public Object getConfigWithServer() {
        Object settings = getAllSettings();
        // Map 형태로 apiServer와 config를 함께 반환
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("apiServer", apiServer);
        result.put("config", settings);
        return result;
    }
}
