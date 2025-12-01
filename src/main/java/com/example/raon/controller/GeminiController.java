package com.example.raon.controller;

import com.example.raon.domain.User;
import com.example.raon.dto.CoverLetterFeedbackRequest;
import com.example.raon.dto.InterviewFeedbackRequest;
import com.example.raon.service.InterviewFeedbackService;
import com.example.raon.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gemini API를 사용한 자기소개서 첨삭 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/gemini")
@RequiredArgsConstructor
public class GeminiController {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final InterviewFeedbackService interviewFeedbackService;
    private final UserService userService;

    /**
     * 자기소개서 첨삭 요청
     * POST /api/gemini/feedback
     */
    @PostMapping("/feedback")
    public ResponseEntity<?> getResumeFeedback(@RequestBody CoverLetterFeedbackRequest request) {
        try {
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

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Gemini API 호출 시작...");
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            log.info("Gemini API 응답 수신 성공");

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                // candidates[0].content.parts[0].text 추출
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
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
                    return ResponseEntity.ok(result);
                } else {
                    log.warn("Gemini 응답에 candidates가 없습니다");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Gemini 응답에 candidates가 없습니다"));
                }
            } else {
                log.warn("응답 body가 null입니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "응답 body가 null입니다"));
            }
        } catch (Exception e) {
            log.error("❌ Gemini API 호출 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 면접 피드백 요청
     * POST /api/gemini/interview-feedback
     */
    @PostMapping("/interview-feedback")
    public ResponseEntity<?> getInterviewFeedback(@RequestBody InterviewFeedbackRequest request) {
        try {
            log.info("면접 피드백 요청 - 메시지 개수: {}", request.getMessages().size());

            // 대화 내역을 텍스트로 변환
            String conversation = request.getMessages().stream()
                    .map(msg -> {
                        String speaker = "user".equals(msg.getRole()) ? "[면접자]" : "[면접관]";
                        return speaker + " " + msg.getContent();
                    })
                    .collect(Collectors.joining("\n\n"));

            String prompt = String.format("""
                    당신은 전문 면접관이자 HR 전문가입니다. 다음 면접 대화 내역을 분석하여 면접자에 대한 종합적인 피드백을 제공해주세요.

                    [면접 대화 내역]
                    %s

                    다음 5가지 항목을 각각 100점 만점으로 평가해주세요:

                    1. **적합성 (100점)**: 질문의 의도에 맞는 답변인가?
                    2. **구체성 (100점)**: 추상적이지 않고 구체적인 사례가 포함되었는가?
                    3. **논리성 (100점)**: 답변의 흐름이 자연스럽고 논리적인가?
                    4. **진정성 (100점)**: 진실이 담긴 답변인가? 외운 느낌은 없는가?
                    5. **차별성 (100점)**: 다른 지원자와 구별되는 본인만의 강점이 드러나는가?

                    각 항목에 대해:
                    - 점수 (0-100점)
                    - 평가 내용 (2-3문장)

                    그리고 위 5가지 항목을 종합적으로 고려하여:
                    - **종합 점수 (0-100점)**: 면접자의 전체적인 면접 수행 능력을 종합 평가한 점수
                      (단순 평균이 아닌, 각 항목의 중요도와 면접자의 전반적인 인상을 고려한 종합 점수)
                    - 전체 평가 요약 (5-7문장)
                    - 면접자의 강점 3가지
                    - 면접자의 개선점 3가지

                    답변은 다음 JSON 형식으로 작성해주세요:
                    {
                      "overallScore": 종합점수(0-100, 전체적인 면접 수행 능력에 대한 종합 평가),
                      "sections": [
                        {
                          "title": "적합성",
                          "score": 점수(0-100),
                          "criteria": "질문의 의도에 맞는 답변인가?",
                          "feedback": "평가 내용"
                        },
                        {
                          "title": "구체성",
                          "score": 점수(0-100),
                          "criteria": "추상적이지 않고 구체적인 사례가 포함되었는가?",
                          "feedback": "평가 내용"
                        },
                        {
                          "title": "논리성",
                          "score": 점수(0-100),
                          "criteria": "답변의 흐름이 자연스럽고 논리적인가?",
                          "feedback": "평가 내용"
                        },
                        {
                          "title": "진정성",
                          "score": 점수(0-100),
                          "criteria": "진실이 담긴 답변인가? 외운 느낌은 없는가?",
                          "feedback": "평가 내용"
                        },
                        {
                          "title": "차별성",
                          "score": 점수(0-100),
                          "criteria": "다른 지원자와 구별되는 본인만의 강점이 드러나는가?",
                          "feedback": "평가 내용"
                        }
                      ],
                      "summary": "전체 평가 요약",
                      "strengths": ["강점1", "강점2", "강점3"],
                      "weaknesses": ["개선점1", "개선점2", "개선점3"]
                    }
                    """, conversation);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Gemini API 호출 시작 (면접 피드백)...");
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            log.info("Gemini API 응답 수신 성공 (면접 피드백)");

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    String text = (String) parts.get(0).get("text");

                    log.info("면접 피드백 응답 텍스트 길이: {}", text.length());

                    // JSON 파싱
                    String jsonText = text.replaceAll("```json\\n?", "").replaceAll("```", "").trim();

                    int startIdx = jsonText.indexOf("{");
                    int endIdx = jsonText.lastIndexOf("}");
                    if (startIdx != -1 && endIdx != -1) {
                        jsonText = jsonText.substring(startIdx, endIdx + 1);
                    }

                    // DB에 저장 시도
                    try {
                        Map<String, Object> feedbackJson = objectMapper.readValue(jsonText, Map.class);
                        Number overallScoreNum = (Number) feedbackJson.get("overallScore");
                        BigDecimal overallScore = new BigDecimal(overallScoreNum.toString());

                        Long chatId = request.getChatId();

                        // 로그인한 사용자 정보 조회 (authentication.getName()은 socialId 반환)
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        String socialId = authentication.getName();
                        User user = userService.getUserBySocialId(socialId);
                        Long userId = user.getUserId();

                        String interviewType = request.getInterviewType() != null ? request.getInterviewType() : "일반 면접";

                        interviewFeedbackService.saveFeedback(userId, chatId, overallScore, jsonText, interviewType);
                        log.info("✅ 면접 피드백 DB 저장 완료 - userId: {}, type: {}, score: {}", userId, interviewType, overallScore);
                    } catch (Exception e) {
                        log.warn("⚠️ 피드백 DB 저장 실패 (응답은 정상 반환): {}", e.getMessage());
                    }

                    Map<String, Object> result = Map.of("text", jsonText);
                    log.info("✅ 면접 피드백 JSON 응답 생성 완료 - 길이: {}", jsonText.length());
                    return ResponseEntity.ok(result);
                } else {
                    log.warn("Gemini 응답에 candidates가 없습니다");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Gemini 응답에 candidates가 없습니다"));
                }
            } else {
                log.warn("응답 body가 null입니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "응답 body가 null입니다"));
            }
        } catch (Exception e) {
            log.error("❌ 면접 피드백 API 호출 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
