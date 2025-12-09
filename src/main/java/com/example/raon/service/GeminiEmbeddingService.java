package com.example.raon.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Gemini Embedding API 서비스
 * 텍스트를 벡터로 변환
 */
@Slf4j
@Service
public class GeminiEmbeddingService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 텍스트를 768차원 벡터로 변환
     *
     * @param text 변환할 텍스트
     * @return 768차원 벡터 배열
     */
    public double[] getEmbedding(String text) {
        try {
            String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=%s",
                geminiApiKey
            );

            Map<String, Object> requestBody = Map.of(
                "model", "models/text-embedding-004",
                "content", Map.of(
                    "parts", List.of(
                        Map.of("text", text)
                    )
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("🔍 Gemini Embedding API 호출 - 텍스트 길이: {}", text.length());

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                (Class<Map<String, Object>>)(Class<?>)Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();

                @SuppressWarnings("unchecked")
                Map<String, Object> embedding = (Map<String, Object>) responseBody.get("embedding");

                @SuppressWarnings("unchecked")
                List<Double> values = (List<Double>) embedding.get("values");

                double[] vector = values.stream().mapToDouble(Double::doubleValue).toArray();
                log.debug("✅ 임베딩 벡터 생성 완료 - 차원: {}", vector.length);

                return vector;
            } else {
                log.error("❌ Gemini Embedding API 오류 - 상태 코드: {}", response.getStatusCode());
                throw new RuntimeException("Embedding API 호출 실패");
            }

        } catch (Exception e) {
            log.error("❌ Gemini Embedding API 호출 중 오류", e);
            throw new RuntimeException("Embedding 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 여러 텍스트를 벡터로 일괄 변환
     *
     * @param texts 변환할 텍스트 리스트
     * @return 벡터 배열 리스트
     */
    public List<double[]> getEmbeddings(List<String> texts) {
        log.info("📦 일괄 임베딩 변환 시작 - 개수: {}", texts.size());

        List<double[]> embeddings = texts.stream()
            .map(this::getEmbedding)
            .toList();

        log.info("✅ 일괄 임베딩 변환 완료 - {}개", embeddings.size());
        return embeddings;
    }
}
