package com.example.raon.controller;

import com.example.raon.dto.CoverLetterFeedbackRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Gemini API를 사용한 자기소개서 첨삭 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;

    public GeminiController(WebClient.Builder webClientBuilder) {
        // 16MB buffer for large responses
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    /**
     * 자기소개서 첨삭 요청
     * POST /api/gemini/feedback
     */
    @PostMapping("/feedback")
    public Mono<ResponseEntity<?>> getResumeFeedback(
            @RequestBody CoverLetterFeedbackRequest request) {

        log.info("AI 첨삭 요청 - 자기소개서 길이: {}", request.getCoverLetter().length());

        String prompt = String.format("""
                당신은 전문 취업 컨설턴트입니다. 다음 자기소개서를 첨삭해주세요.

                [자기소개서 내용]
                %s

                [지원자 정보]
                - 이름: %s
                - 희망 직무: %s
                - 기술 스택: %s
                - 학력: %s %s
                - 경력: %s

                다음 항목들을 평가하고 구체적인 피드백을 제공해주세요:

                1. **전반적인 인상** (5점 만점)
                2. **구조와 논리성** (5점 만점)
                3. **구체성과 사례** (5점 만점)
                4. **문법과 표현** (5점 만점)

                각 항목에 대해:
                - 점수와 함께 좋은 점 2-3개
                - 개선이 필요한 점 2-3개
                - 구체적인 수정 제안

                마지막으로 전체 요약과 추천 점수를 제공해주세요.

                답변은 다음 JSON 형식으로 작성해주세요:
                {
                  "overallScore": 숫자,
                  "sections": [
                    {
                      "title": "섹션 제목",
                      "score": 숫자,
                      "strengths": ["강점1", "강점2"],
                      "improvements": ["개선점1", "개선점2"],
                      "suggestions": "구체적인 수정 제안"
                    }
                  ],
                  "summary": "전체 요약",
                  "recommendedScore": 숫자
                }
                """,
                request.getCoverLetter(),
                request.getName() != null ? request.getName() : "미입력",
                request.getDesiredPosition() != null ? request.getDesiredPosition() : "미입력",
                request.getSkills() != null ? request.getSkills() : "미입력",
                request.getSchoolName() != null ? request.getSchoolName() : "미입력",
                request.getMajor() != null ? request.getMajor() : "",
                request.getCompanyName() != null ? request.getCompanyName() + " (" + request.getPosition() + ")" : "미입력"
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/gemini-2.5-flash:generateContent")
                        .queryParam("key", geminiApiKey)
                        .build())
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> {
                            log.error("Gemini API HTTP 오류 - Status Code: {}", response.statusCode());
                            return response.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("Gemini API 오류 응답 본문: {}", errorBody);
                                        return Mono.error(new RuntimeException("Gemini API 호출 실패 (Status: "
                                                + response.statusCode() + "): " + errorBody));
                                    });
                        })
                .bodyToMono(Map.class)
                .map(response -> {
                    try {
                        log.info("Gemini API 응답 수신 성공");

                        // candidates[0].content.parts[0].text 추출
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                        if (candidates != null && !candidates.isEmpty()) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                            String text = (String) parts.get(0).get("text");

                            log.info("Gemini 응답 텍스트 길이: {}", text.length());

                            // JSON 파싱 시도
                            String jsonText = text.replaceAll("```json\\n?", "").replaceAll("```", "").trim();

                            // JSON 블록 추출
                            int startIdx = jsonText.indexOf("{");
                            int endIdx = jsonText.lastIndexOf("}");
                            if (startIdx != -1 && endIdx != -1) {
                                jsonText = jsonText.substring(startIdx, endIdx + 1);
                            }

                            Map<String, Object> result = Map.of("text", jsonText);
                            log.info("✅ JSON 응답 생성 완료 - 길이: {}", jsonText.length());
                            return (ResponseEntity<?>) ResponseEntity.ok(result);
                        } else {
                            log.warn("Gemini 응답에 candidates가 없습니다");
                        }
                    } catch (Exception e) {
                        log.error("❌ 응답 파싱 중 오류", e);
                        return (ResponseEntity<?>) ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", "응답 파싱 실패: " + e.getMessage()));
                    }

                    log.warn("기본 응답 반환");
                    return (ResponseEntity<?>) ResponseEntity.ok(response);
                })
                .onErrorResume(error -> {
                    log.error("Gemini API 호출 중 오류 발생", error);
                    Map<String, Object> errorBody = Map.of("error", error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody));
                });
    }
}
