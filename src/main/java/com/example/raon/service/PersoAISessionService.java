package com.example.raon.service;

import com.example.raon.dto.SessionCreateRequest;
import com.example.raon.dto.SessionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

@Service
@Slf4j
public class PersoAISessionService {

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // 재시도 설정
    private static final int MAX_RETRY_ATTEMPTS = 10;
    private static final long RETRY_DELAY_MS = 500; // 500ms (빠른 재시도로 사용자 경험 개선)

    public PersoAISessionService(RestTemplateBuilder restTemplateBuilder) {
        // 타임아웃 설정: 연결 타임아웃 10초, 읽기 타임아웃 30초
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * PersoAI 세션 생성 (재시도 로직 포함)
     * POST /api/v1/session/
     */
    public SessionResponse createSession(SessionCreateRequest request) {
        String url = apiServer + "/api/v1/session/";

        // 요청 데이터 변환 (PersoAI API 형식에 맞춤)
        Map<String, Object> requestBody = buildRequestBody(request);

        // HTTP 요청 헤더
        HttpHeaders headers = new HttpHeaders();
        headers.set("PersoLive-APIKey", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(requestBody, headers);

        log.info("📤 PersoAI 세션 생성 요청: {}", url);
        log.info("📦 요청 본문 (capability 디버깅): {}", requestBody);

        // 재시도 로직
        Exception lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                log.info("🔄 세션 생성 시도 {}/{}", attempt, MAX_RETRY_ATTEMPTS);

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

                log.info("✅ 세션 생성 완료 (시도 {}): {}", attempt, sessionResponse.getSessionId());
                return sessionResponse;

            } catch (HttpServerErrorException e) {
                lastException = e;
                log.warn("⚠️ 서버 에러 (시도 {}): {} - {}", attempt, e.getStatusCode(), e.getResponseBodyAsString());

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    log.info("⏳ {}ms 후 재시도...", RETRY_DELAY_MS);
                    sleep(RETRY_DELAY_MS);
                }

            } catch (HttpClientErrorException e) {
                // PersoAI API의 간헐적 버그: "Prompt is required for Capability STF_WEBRTC" 에러는 재시도
                String responseBody = e.getResponseBodyAsString();
                boolean isIntermittentPromptError = responseBody != null &&
                        responseBody.contains("Prompt is required for Capability STF_WEBRTC");

                if (isIntermittentPromptError && attempt < MAX_RETRY_ATTEMPTS) {
                    lastException = e;
                    log.warn("⚠️ PersoAI 간헐적 validation 에러 (시도 {}): {} - {}",
                            attempt, e.getStatusCode(), responseBody);
                    log.info("⏳ {}ms 후 재시도... (PersoAI API 버그 우회)", RETRY_DELAY_MS);
                    sleep(RETRY_DELAY_MS);
                } else {
                    // 일반 클라이언트 에러는 재시도하지 않음
                    log.error("❌ 클라이언트 에러: {} - {}", e.getStatusCode(), responseBody);
                    throw new RuntimeException("세션 생성 실패 (클라이언트 에러): " + e.getMessage(), e);
                }

            } catch (ResourceAccessException e) {
                lastException = e;
                log.warn("⚠️ 네트워크 타임아웃/연결 실패 (시도 {}): {}", attempt, e.getMessage());

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    log.info("⏳ {}ms 후 재시도...", RETRY_DELAY_MS);
                    sleep(RETRY_DELAY_MS);
                }

            } catch (Exception e) {
                lastException = e;
                log.error("❌ 예상치 못한 에러 (시도 {}): {}", attempt, e.getMessage(), e);

                if (attempt < MAX_RETRY_ATTEMPTS) {
                    log.info("⏳ {}ms 후 재시도...", RETRY_DELAY_MS);
                    sleep(RETRY_DELAY_MS);
                } else {
                    break;
                }
            }
        }

        // 모든 재시도 실패
        log.error("❌ {} 번의 재시도 후에도 세션 생성 실패", MAX_RETRY_ATTEMPTS);
        throw new RuntimeException("세션 생성 실패 (재시도 " + MAX_RETRY_ATTEMPTS + "회): " +
                                   (lastException != null ? lastException.getMessage() : "Unknown error"),
                                   lastException);
    }

    /**
     * 요청 본문 생성
     */
    private Map<String, Object> buildRequestBody(SessionCreateRequest request) {
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

        // background_image는 필수 필드이므로, null이어도 빈 문자열로 전송
        // PersoAI API가 기본값을 사용하도록 함
        String backgroundImage = request.getBackgroundImageId();
        if (backgroundImage == null) {
            backgroundImage = ""; // 빈 문자열로 기본값 사용
            log.info("⚠️ backgroundImageId가 null이므로 빈 문자열 사용");
        }
        requestBody.put("background_image", backgroundImage);

        requestBody.put("agent", request.getAgent());
        requestBody.put("padding_left", request.getPaddingLeft());
        requestBody.put("padding_top", request.getPaddingTop());
        requestBody.put("padding_height", request.getPaddingHeight());

        // capability 필드를 아예 보내지 않음 (PersoAI API가 자동으로 처리하도록)
        // 재시도 로직으로 간헐적 에러 우회
        // requestBody.put("capability", Collections.emptyList());

        if (request.getExtraData() != null) {
            requestBody.put("extra_data", request.getExtraData());
        }

        // MCP servers (optional)
        if (request.getMcpServers() != null && !request.getMcpServers().isEmpty()) {
            requestBody.put("mcp_servers", request.getMcpServers());
        }

        return requestBody;
    }

    /**
     * 재시도 대기
     */
    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("재시도 대기 중 인터럽트 발생");
        }
    }

    /**
     * 세션 조회
     */
    public SessionResponse getSession(String sessionId) {
        try {
            String url = apiServer + "/api/v1/session/" + sessionId + "/";

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

    /**
     * 모든 활성 세션 조회
     */
    public JsonNode getAllSessions() {
        try {
            String url = apiServer + "/api/v1/session/";

            HttpHeaders headers = new HttpHeaders();
            headers.set("PersoLive-APIKey", apiKey);

            HttpEntity<Void> request = new HttpEntity<>(headers);

            log.info("📋 모든 세션 조회 요청: {}", url);

            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            log.info("✅ 세션 목록 조회 완료");

            return root;

        } catch (Exception e) {
            log.error("❌ 세션 목록 조회 실패", e);
            throw new RuntimeException("세션 목록 조회 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 세션 삭제
     */
    public void deleteSession(String sessionId) {
        try {
            String url = apiServer + "/api/v1/session/" + sessionId + "/";

            HttpHeaders headers = new HttpHeaders();
            headers.set("PersoLive-APIKey", apiKey);

            HttpEntity<Void> request = new HttpEntity<>(headers);

            log.info("🗑️ 세션 삭제 요청: {}", sessionId);

            restTemplate.exchange(url, HttpMethod.DELETE, request, String.class);

            log.info("✅ 세션 삭제 완료: {}", sessionId);

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("⚠️ 세션이 이미 삭제됨: {}", sessionId);
            } else {
                log.error("❌ 세션 삭제 실패: {} - {}", sessionId, e.getMessage());
                throw new RuntimeException("세션 삭제 실패: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("❌ 세션 삭제 실패: {}", sessionId, e);
            throw new RuntimeException("세션 삭제 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 모든 활성 세션 정리
     */
    public int cleanupAllSessions() {
        try {
            log.info("🧹 모든 활성 세션 정리 시작");

            JsonNode sessions = getAllSessions();

            if (!sessions.has("results") || !sessions.get("results").isArray()) {
                log.info("✅ 정리할 세션이 없습니다");
                return 0;
            }

            JsonNode results = sessions.get("results");
            int totalCount = results.size();
            int successCount = 0;

            log.info("📊 총 {} 개의 활성 세션 발견", totalCount);

            for (JsonNode session : results) {
                String sessionId = session.get("session_id").asText();
                try {
                    deleteSession(sessionId);
                    successCount++;
                } catch (Exception e) {
                    log.warn("⚠️ 세션 삭제 중 에러 (계속 진행): {}", sessionId);
                }
            }

            log.info("✅ 세션 정리 완료: {}/{} 개 삭제", successCount, totalCount);
            return successCount;

        } catch (Exception e) {
            log.error("❌ 세션 정리 실패", e);
            throw new RuntimeException("세션 정리 실패: " + e.getMessage(), e);
        }
    }
}