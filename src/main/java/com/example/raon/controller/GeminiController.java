package com.example.raon.controller;

import com.example.raon.domain.User;
import com.example.raon.dto.CoverLetterFeedbackRequest;
import com.example.raon.dto.InterviewFeedbackRequest;
import com.example.raon.service.CoverLetterExampleService;
import com.example.raon.service.InterviewExampleService;
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
    private final CoverLetterExampleService exampleService;
    private final InterviewExampleService interviewExampleService;
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

            // RAG: 사용자 정보 기반 관련 예시 검색
            List<CoverLetterExampleService.CoverLetterExample> relevantExamples =
                    exampleService.searchRelevant(
                            request.getDesiredPosition(),
                            request.getSkills(),
                            2  // 상위 2개 예시 사용
                    );

            // 동적 예시 생성
            StringBuilder examplesText = new StringBuilder();
            for (int i = 0; i < relevantExamples.size(); i++) {
                CoverLetterExampleService.CoverLetterExample ex = relevantExamples.get(i);
                examplesText.append(String.format("[우수 자소서 예시 %d - %d점대]\n\"%s\"\n\n",
                        i + 1, ex.getScore(), ex.getContent()));
            }

            // 예시가 없으면 기본 예시 사용
            if (examplesText.length() == 0) {
                examplesText.append("""
                [우수 자소서 예시 - 90점대]
                "대학교 2학년 때 진행한 '스마트 농장 관리 시스템' 프로젝트는 제 개발 인생의 전환점이었습니다.
                농촌 지역의 인력 부족 문제를 해결하기 위해 IoT 센서와 AI 기반 작물 상태 분석 시스템을 개발했고,
                실제 농장에 3개월간 시범 적용한 결과 인건비를 30%%, 작물 수확량을 15%% 향상시켰습니다."

                """);
            }

            log.info("✅ RAG: {}개의 관련 예시 선택됨", relevantExamples.size());

            String prompt = String.format("""
                    당신은 삼성, 네이버, 카카오 등 대기업 인사팀에서 10년 이상 근무한 전문 채용 담당자입니다.
                    수천 개의 자기소개서를 검토한 경험을 바탕으로 엄격하고 객관적인 첨삭을 제공해주세요.

                    %s

                    [보통 자소서 예시 - 50-60점대]
                    "저는 컴퓨터공학을 전공하며 개발에 관심을 가지게 되었습니다. 팀 프로젝트를 통해 협업의 중요성을
                    배웠고, 항상 최선을 다하는 자세로 임했습니다. 앞으로도 열심히 노력하겠습니다."

                    평가: 구체성 30점, 논리성 50점, 차별성 35점, 문법 70점
                    이유: 추상적, 진부한 표현, 구체적 경험 부족, 차별성 없음

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [평가 대상 자기소개서]
                    %s

                    [지원자 정보]
                    - 이름: %s
                    - 희망 직무: %s
                    - 기술 스택: %s
                    - 학력: %s %s
                    - 경력: %s

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [평가 기준 - 각 5점 만점]

                    **1. 전반적인 인상 (첫인상, 몰입도)**
                    - 5점: 첫 문장부터 강렬한 인상. 끝까지 읽고 싶게 만드는 흡입력
                    - 3-4점: 무난하지만 특별히 기억에 남지 않음
                    - 1-2점: 지루하고 천편일률적. 다른 자소서와 구별 안됨

                    **2. 구조와 논리성 (STAR, 인과관계)**
                    - 5점: STAR 기법 완벽 적용. 상황→행동→결과의 명확한 인과관계
                    - 3-4점: 구조는 있으나 일부 논리적 비약 존재
                    - 1-2점: 생각나는 대로 나열. 앞뒤가 안 맞음

                    **3. 구체성과 사례 (수치, 고유명사, 디테일)**
                    - 5점: 수치, 기술명, 구체적 상황 5개 이상. 실제 경험에서만 나올 디테일
                    - 3-4점: 일부 구체적 요소 있으나 여전히 추상적
                    - 1-2점: "열심히", "최선을" 등 완전히 추상적

                    **4. 문법과 표현 (가독성, 참신성)**
                    - 5점: 문법 완벽 + 참신한 표현 + 능동적 문장
                    - 3-4점: 문법 무난하나 진부한 표현 多
                    - 1-2점: 문법 오류 多 또는 읽기 어려움

                    위 기준으로 **엄격하게** 평가하고, **개선된 자기소개서 전문**을 작성해주세요.
                    - 원본의 핵심 경험은 유지하되 모든 피드백 반영
                    - 첫 문장을 강렬하게 (우수 예시 참고)
                    - 정량적 성과 추가 (가능한 범위 내에서)
                    - STAR 기법으로 재구성
                    - 상투적 표현 완전 제거

                    답변은 다음 JSON 형식으로 작성해주세요:
                    {
                      "overallScore": 숫자(1-5, 소수점 1자리),
                      "sections": [
                        {
                          "title": "섹션 제목",
                          "score": 숫자(1-5, 소수점 1자리),
                          "strengths": ["강점1 (구체적으로)", "강점2"],
                          "improvements": ["개선점1 (실행 가능하게)", "개선점2"],
                          "suggestions": "수정 제안 (피드백 설명, 예시 포함)"
                        }
                      ],
                      "summary": "전체 평가 요약 (5-7문장, 엄격하게)",
                      "recommendedScore": 숫자(1-5, 소수점 1자리),
                      "revisedCoverLetter": "피드백을 모두 반영한 새 자기소개서 (800-1200자, 우수 예시 수준으로)",
                      "improvementPoints": ["원본 대비 개선된 점 1", "개선된 점 2", "개선된 점 3"]
                    }
                    """,
                    examplesText.toString(),  // RAG로 선택된 동적 예시
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
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.3,        // 일관성과 정확성 향상 (0.0-1.0)
                            "topP", 0.85,             // 상위 85% 확률 토큰 사용
                            "topK", 40,               // 상위 40개 토큰 중 선택
                            "maxOutputTokens", 8192,  // 최대 응답 길이
                            "candidateCount", 1       // 생성할 응답 후보 수
                    )
            );

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Retry with exponential backoff (503 에러 대응)
            ResponseEntity<Map> response = null;
            int maxRetries = 3;
            int retryDelay = 1000; // 1초

            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    log.info("Gemini API 호출 시도 {}/{}...", attempt, maxRetries);
                    response = restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            Map.class
                    );
                    log.info("✅ Gemini API 응답 수신 성공");
                    break; // 성공하면 루프 탈출
                } catch (Exception e) {
                    String errorMsg = e.getMessage();
                    boolean is503 = errorMsg != null && errorMsg.contains("503");

                    if (is503 && attempt < maxRetries) {
                        log.warn("⚠️ 503 Service Unavailable - {}초 후 재시도... ({}/{})",
                                retryDelay / 1000, attempt, maxRetries);
                        try {
                            Thread.sleep(retryDelay);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                        retryDelay *= 2; // Exponential backoff
                    } else {
                        // 503이 아니거나 마지막 시도면 예외 던지기
                        throw e;
                    }
                }
            }

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

            // RAG: 면접관 질문에서 키워드 추출하여 관련 우수 답변 예시 검색
            String interviewQuestions = request.getMessages().stream()
                    .filter(msg -> !"user".equals(msg.getRole())) // 면접관 질문만
                    .map(msg -> msg.getContent())
                    .collect(Collectors.joining(" "));

            List<InterviewExampleService.InterviewExample> relevantExamples =
                    interviewExampleService.searchRelevant(interviewQuestions, 3);

            // 동적 예시 생성
            StringBuilder examplesText = new StringBuilder();
            for (int i = 0; i < relevantExamples.size(); i++) {
                InterviewExampleService.InterviewExample ex = relevantExamples.get(i);
                examplesText.append(String.format("""
                        [우수 답변 예시 %d - %d점대]
                        질문: "%s"
                        답변: "%s"

                        평가: %s

                        """, i + 1, ex.getScore(), ex.getQuestion(), ex.getAnswer(), ex.getEvaluation()));
            }

            log.info("✅ RAG: {}개의 관련 면접 예시 선택됨", relevantExamples.size());

            String prompt = String.format("""
                    당신은 삼성, LG, 네이버, 카카오 등 대기업 면접을 10년 이상 진행한 전문 면접관입니다.

                    %s[면접 대화 내역]
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
                    """, examplesText.toString(), conversation);

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
                            "maxOutputTokens", 8192,  // 최대 응답 길이 (thinking 토큰 고려)
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

    /**
     * LLM-as-a-Judge: 원본과 수정본 비교 평가
     * POST /api/gemini/judge
     */
    @PostMapping("/judge")
    public ResponseEntity<?> judgeRevision(@RequestBody com.example.raon.dto.CoverLetterJudgeRequest request) {
        try {
            log.info("LLM-as-a-Judge 요청 - 원본: {}자, 수정본: {}자",
                    request.getOriginalCoverLetter().length(),
                    request.getRevisedCoverLetter().length());

            String prompt = String.format("""
                    당신은 객관적이고 공정한 자기소개서 평가 전문가입니다.
                    원본 자기소개서와 AI가 수정한 자기소개서를 비교 평가해주세요.

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [원본 자기소개서]
                    %s

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [수정된 자기소개서]
                    %s

                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [평가 기준]

                    다음 항목들에 대해 **원본 대비 수정본이 실제로 개선되었는지** 엄격하게 평가하세요:

                    1. **구체성 향상** (1-10점)
                       - 추상적 표현이 구체적으로 변경되었는가?
                       - 수치, 고유명사, 기술명 등이 추가되었는가?

                    2. **논리성 강화** (1-10점)
                       - STAR 기법이 적용되어 인과관계가 명확해졌는가?
                       - 문단 간 연결이 매끄러워졌는가?

                    3. **차별성 증대** (1-10점)
                       - 상투적 표현이 제거되고 참신한 표현으로 변경되었는가?
                       - 지원자만의 강점이 더 부각되었는가?

                    4. **가독성 개선** (1-10점)
                       - 문장이 더 간결하고 명확해졌는가?
                       - 전문 용어의 사용이 적절한가?

                    5. **첫인상 강화** (1-10점)
                       - 도입부가 더 강렬하고 인상적인가?
                       - 읽고 싶게 만드는 흡입력이 생겼는가?

                    **중요: 과대평가 금지**
                    - 단순히 분량만 늘렸거나 문장만 바꾼 경우 → 낮은 점수
                    - 실질적으로 내용의 질이 향상된 경우만 → 높은 점수
                    - 원본의 핵심 경험을 잃어버린 경우 → 감점

                    **전체 개선도**
                    - 1-3점: 거의 개선 없음 또는 오히려 악화
                    - 4-6점: 일부 개선되었으나 여전히 부족
                    - 7-8점: 명확한 개선, 실무에서 사용 가능
                    - 9-10점: 뛰어난 개선, 합격 가능성 대폭 상승

                    답변은 다음 JSON 형식으로 작성해주세요:
                    {
                      "overallImprovement": 숫자(1-10, 전체 개선도),
                      "criteriaScores": {
                        "specificity": 숫자(1-10),
                        "logic": 숫자(1-10),
                        "uniqueness": 숫자(1-10),
                        "readability": 숫자(1-10),
                        "firstImpression": 숫자(1-10)
                      },
                      "improvements": [
                        "구체적으로 개선된 점 1 (예시 포함)",
                        "구체적으로 개선된 점 2",
                        "구체적으로 개선된 점 3"
                      ],
                      "regressions": [
                        "오히려 나빠진 점 또는 주의할 점 (없으면 빈 배열)"
                      ],
                      "recommendation": "수정본 사용을 추천하는가? (강력 추천 / 추천 / 조건부 추천 / 비추천)",
                      "reasoning": "추천 이유 또는 비추천 이유 (3-5문장, 구체적으로)",
                      "verdict": "최종 판정 (3-5문장으로 요약)"
                    }
                    """,
                    request.getOriginalCoverLetter(),
                    request.getRevisedCoverLetter()
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.2,        // Judge는 더 엄격하게 (일관성 중시)
                            "topP", 0.9,
                            "topK", 40,
                            "maxOutputTokens", 4096,
                            "candidateCount", 1
                    )
            );

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("LLM-as-a-Judge API 호출 시작...");
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            log.info("LLM-as-a-Judge API 응답 수신 성공");

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

                    log.info("Judge 응답 텍스트 길이: {}", text.length());

                    // JSON 파싱
                    String jsonText = text.replaceAll("```json\\n?", "").replaceAll("```", "").trim();

                    int startIdx = jsonText.indexOf("{");
                    int endIdx = jsonText.lastIndexOf("}");
                    if (startIdx != -1 && endIdx != -1) {
                        jsonText = jsonText.substring(startIdx, endIdx + 1);
                    }

                    Map<String, Object> result = Map.of("text", jsonText);
                    log.info("✅ Judge JSON 응답 생성 완료 - 길이: {}", jsonText.length());
                    return ResponseEntity.ok(result);
                } else {
                    log.warn("Judge 응답에 candidates가 없습니다");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Judge 응답에 candidates가 없습니다"));
                }
            } else {
                log.warn("Judge 응답 body가 null입니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "응답 body가 null입니다"));
            }
        } catch (Exception e) {
            log.error("❌ LLM-as-a-Judge API 호출 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
