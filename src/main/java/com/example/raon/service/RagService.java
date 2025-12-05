package com.example.raon.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * RAG 서버와 통신하여 유사한 면접 답변 예시를 검색하는 서비스
 */
@Slf4j
@Service
public class RagService {

    private final RestTemplate restTemplate;

    @Value("${rag.server.url:http://localhost:8000}")
    private String ragServerUrl;

    public RagService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 질문과 유사한 우수 답변 예시 검색
     *
     * @param question 검색할 질문
     * @param topK 반환할 결과 개수 (기본 3개)
     * @return 유사한 답변 예시 목록
     */
    public List<ExampleAnswer> searchSimilarExamples(String question, int topK) {
        try {
            String url = ragServerUrl + "/search";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                    "question", question,
                    "top_k", topK
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("🔍 RAG 서버에 검색 요청: {}", question);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> examples = (List<Map<String, Object>>) response.getBody().get("examples");

                List<ExampleAnswer> results = new ArrayList<>();
                if (examples != null) {
                    for (Map<String, Object> example : examples) {
                        results.add(new ExampleAnswer(
                                (String) example.get("question"),
                                (String) example.get("answer"),
                                ((Number) example.get("score")).intValue(),
                                (String) example.getOrDefault("category", "일반"),
                                ((Number) example.getOrDefault("similarity", 0.0)).doubleValue()
                        ));
                    }
                }

                log.info("✅ RAG 서버에서 {}개 결과 반환", results.size());
                return results;
            }

            log.warn("⚠️ RAG 서버 응답 이상: {}", response.getStatusCode());
            return new ArrayList<>();

        } catch (Exception e) {
            log.error("❌ RAG 서버 호출 실패: {}", e.getMessage());
            // RAG 서버 실패 시 빈 리스트 반환 (fallback)
            return new ArrayList<>();
        }
    }

    /**
     * 우수 답변 예시 추가
     *
     * @param question 질문
     * @param answer 답변
     * @param score 점수 (0-100)
     * @param category 카테고리 (선택)
     * @return 성공 여부
     */
    public boolean addExample(String question, String answer, int score, String category) {
        try {
            String url = ragServerUrl + "/add";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                    "question", question,
                    "answer", answer,
                    "score", score,
                    "category", category != null ? category : "일반"
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("➕ RAG 서버에 답변 추가 요청: {} (점수: {})", question, score);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("✅ RAG 서버에 답변 추가 완료");
                return true;
            }

            return false;

        } catch (Exception e) {
            log.error("❌ RAG 서버 답변 추가 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * RAG 서버 헬스 체크
     *
     * @return 서버 상태 및 저장된 예시 개수
     */
    public HealthStatus checkHealth() {
        try {
            String url = ragServerUrl + "/health";

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String status = (String) response.getBody().get("status");
                int count = ((Number) response.getBody().get("collection_count")).intValue();

                return new HealthStatus(true, status, count);
            }

            return new HealthStatus(false, "error", 0);

        } catch (Exception e) {
            log.error("❌ RAG 서버 헬스 체크 실패: {}", e.getMessage());
            return new HealthStatus(false, "unreachable", 0);
        }
    }

    /**
     * 우수 답변 예시 DTO
     */
    public record ExampleAnswer(
            String question,
            String answer,
            int score,
            String category,
            double similarity
    ) {}

    /**
     * 헬스 체크 결과 DTO
     */
    public record HealthStatus(
            boolean isHealthy,
            String status,
            int exampleCount
    ) {}
}
