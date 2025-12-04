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
                    당신은 삼성, LG, 네이버, 카카오 등 대기업 면접을 10년 이상 진행한 전문 면접관입니다.

                    [우수 답변 예시 1 - 90점대]
                    질문: "팀 프로젝트에서 갈등을 해결한 경험이 있나요?"
                    답변: "백엔드 개발 중 API 설계 방식으로 팀원과 의견 충돌이 있었습니다. 저는 RESTful 방식을 주장했고 동료는 GraphQL을 선호했습니다. 양측 장단점을 문서화하고, 프로토타입을 각각 2일간 개발해 성능 테스트를 진행했습니다. 결과적으로 우리 서비스의 단순한 CRUD 특성상 RESTful이 더 적합하다는 데이터를 제시하여 합의했고, 이후 GraphQL의 장점은 차기 프로젝트에 반영하기로 했습니다."

                    평가: 적합성 95점, 구체성 98점, 논리성 92점, 진정성 90점, 차별성 88점
                    이유: 구체적 상황, 정량적 근거(2일간), 해결 과정, 후속 조치까지 완벽. 실제 경험에서 나온 디테일이 풍부함.

                    [우수 답변 예시 2 - 85점대]
                    질문: "본인의 가장 큰 실패 경험과 그로부터 배운 점을 말해주세요."
                    답변: "대학교 3학년 때 팀 프로젝트에서 리더를 맡았는데, 제가 코드 리뷰를 소홀히 하면서 마감 2일 전 치명적인 버그가 발견됐습니다. 결국 밤을 새워 수정했지만 발표 퀄리티가 떨어졌고 B학점을 받았습니다. 이후로는 매일 코드 리뷰 시간을 30분씩 확보하고, CI/CD 파이프라인에 자동 테스트를 도입했습니다. 현재 인턴십에서는 이 경험 덕분에 버그를 사전에 3건이나 방지했습니다."

                    평가: 적합성 90점, 구체성 85점, 논리성 88점, 진정성 92점, 차별성 80점
                    이유: 솔직한 실패 고백, 구체적 개선 행동, 실제 성과까지 연결. 진정성이 돋보임.

                    [보통 답변 예시 - 50-60점대]
                    질문: "팀 프로젝트에서 갈등을 해결한 경험이 있나요?"
                    답변: "네, 팀 프로젝트에서 의견이 달라서 서로 토론을 통해 해결했습니다. 각자 의견을 들어보고 합의점을 찾아 프로젝트를 성공적으로 마쳤습니다."

                    평가: 적합성 60점, 구체성 30점, 논리성 50점, 진정성 45점, 차별성 35점
                    이유: 질문에는 맞지만 추상적이고 구체성 부족. 누구나 할 수 있는 답변으로 차별성 없음.

                    [면접 대화 내역]
                    %s

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [평가 기준 - 각 항목별 상세 루브릭]
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    **1. 적합성 (질문의 의도에 맞는 답변인가?)**
                    - 90-100점: 질문의 핵심을 정확히 파악하고 완벽히 답변. 질문자가 원하는 정보를 모두 제공
                    - 70-89점: 질문에 대체로 맞는 답변이나 일부 핵심 내용 누락
                    - 50-69점: 질문과 관련은 있으나 핵심을 비껴가거나 부분적으로만 답변
                    - 30-49점: 질문과 부분적으로만 관련되며 대부분 다른 이야기
                    - 0-29점: 질문과 무관한 답변

                    **2. 구체성 (추상적이지 않고 구체적인 사례가 포함되었는가?)**
                    - 90-100점: 수치, 날짜, 고유명사, 기술명 등 구체적 요소 5개 이상 + 상세한 과정 설명
                    - 70-89점: 구체적 사례 3-4개 + 과정 설명. "약 3개월간", "5명의 팀원" 등
                    - 50-69점: 구체적 사례 1-2개 포함. "프로젝트에서", "팀원과" 등 일부만 구체적
                    - 30-49점: 대부분 추상적이나 일부 구체성 있음. "한 번", "어떤 프로젝트" 등
                    - 0-29점: "항상", "언제나", "열심히" 등 완전히 추상적이고 일반적인 표현만 사용

                    **3. 논리성 (답변의 흐름이 자연스럽고 논리적인가?)**
                    - 90-100점: STAR(상황-과제-행동-결과) 또는 명확한 인과관계로 구조화. 논리적 비약 없음
                    - 70-89점: 대체로 논리적이나 일부 연결이 약하거나 순서가 다소 어색
                    - 50-69점: 기승전결이 있으나 논리적 비약이 있거나 인과관계 불명확
                    - 30-49점: 이야기가 산만하고 앞뒤가 맞지 않는 부분이 많음
                    - 0-29점: 논리적 구조 없이 생각나는 대로 나열

                    **4. 진정성 (진실이 담긴 답변인가? 외운 느낌은 없는가?)**
                    - 90-100점: 실제 경험에서만 나올 수 있는 디테일, 감정, 고민이 생생하게 드러남
                    - 70-89점: 대체로 진실해 보이나 일부 준비된 느낌. 자연스러운 말투
                    - 50-69점: 외운 듯한 표현과 자연스러운 표현 혼재. "항상 ~합니다" 등의 과장
                    - 30-49점: 대부분 틀에 박힌 표현. "최선을 다해", "열심히" 등 클리셰 다수
                    - 0-29점: 완전히 외운 답변. 로봇 같은 느낌. 감정이나 고민 없음

                    **5. 차별성 (다른 지원자와 구별되는 본인만의 강점이 드러나는가?)**
                    - 90-100점: 지원자만의 독특한 경험, 관점, 해결방식이 명확히 드러남
                    - 70-89점: 일부 차별화 요소 있으나 다른 지원자도 할 수 있는 답변 포함
                    - 50-69점: 일반적인 답변이나 약간의 개성 있음
                    - 30-49점: 대부분 평범하고 누구나 할 수 있는 답변
                    - 0-29점: 완전히 일반적. "팀워크 중요", "성실함" 등 진부한 내용만

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    위 평가 기준과 우수 답변 예시를 참고하여, 위 면접 대화를 엄격하고 공정하게 평가해주세요.

                    각 항목에 대해:
                    - 점수 (0-100점, 위 루브릭 기준 적용)
                    - 평가 내용 (3-4문장, 구체적인 근거와 함께)

                    그리고 위 5가지 항목을 종합적으로 고려하여:
                    - **종합 점수 (0-100점)**: 면접자의 전체적인 면접 수행 능력을 종합 평가한 점수
                      (단순 평균이 아닌, 각 항목의 중요도와 면접자의 전반적인 인상을 고려한 종합 점수)
                    - 전체 평가 요약 (5-7문장, 구체적인 근거 포함)
                    - 면접자의 강점 3가지 (구체적으로)
                    - 면접자의 개선점 3가지 (실행 가능한 조언과 함께)

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
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.4,        // 일관성 향상 (0.0-1.0, 낮을수록 일관적)
                            "topP", 0.8,              // 상위 80% 확률 토큰 사용
                            "topK", 40,               // 상위 40개 토큰 중 선택
                            "maxOutputTokens", 2048,  // 최대 응답 길이
                            "candidateCount", 1       // 생성할 응답 후보 수
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

                        // 로그인한 사용자 정보 조회 (authentication.getName()은 userId를 String으로 반환)
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        Long userId = Long.parseLong(authentication.getName());

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
