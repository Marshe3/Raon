package com.example.raon;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * LLM을 사용한 피드백 품질 자동 평가 테스트
 */
public class FeedbackQualityTest {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 개선 전/후 프롬프트로 생성된 피드백 품질 비교
     */
    @Test
    public void testFeedbackQualityImprovement() {
        // 테스트용 면접 답변 샘플
        String[] testAnswers = {
            // 샘플 1: 추상적 답변
            """
            [면접관] 팀 프로젝트에서 갈등을 해결한 경험이 있나요?
            [면접자] 네, 있습니다. 팀원들과 의견이 달라서 갈등이 있었는데
            대화를 통해 잘 해결했습니다. 그래서 프로젝트를 성공적으로 마칠 수 있었습니다.
            """,

            // 샘플 2: 구체적 답변
            """
            [면접관] 팀 프로젝트에서 갈등을 해결한 경험이 있나요?
            [면접자] 네, 지난 학기 웹 개발 프로젝트에서 5명의 팀원 중 2명이
            프론트엔드 프레임워크 선택으로 의견이 나뉘었습니다.
            저는 React를 선호했고 다른 팀원은 Vue를 원했습니다.
            2일간 각각 프로토타입을 만들어 성능과 학습곡선을 비교했고,
            최종적으로 팀원 전체가 익숙한 React를 선택했습니다.
            결과적으로 3주 만에 프로젝트를 완성하고 A학점을 받았습니다.
            """,

            // 샘플 3: 보통 답변
            """
            [면접관] 본인의 강점을 말해주세요.
            [면접자] 저의 강점은 꾸준함과 성실함입니다.
            어떤 일이든 포기하지 않고 끝까지 해내는 성격입니다.
            또한 팀워크를 중요하게 생각하고 동료들과 잘 협력합니다.
            """
        };

        System.out.println("=".repeat(80));
        System.out.println("피드백 품질 자동 평가 테스트");
        System.out.println("=".repeat(80));

        for (int i = 0; i < testAnswers.length; i++) {
            System.out.println("\n[테스트 " + (i + 1) + "]");
            System.out.println(testAnswers[i].trim());

            // 1. 개선 전 프롬프트로 피드백 생성
            String feedbackBefore = generateFeedbackOldPrompt(testAnswers[i]);

            // 2. 개선 후 프롬프트로 피드백 생성
            String feedbackAfter = generateFeedbackNewPrompt(testAnswers[i]);

            // 3. LLM으로 두 피드백 품질 평가
            QualityScore scoreBefore = evaluateFeedbackQuality(testAnswers[i], feedbackBefore);
            QualityScore scoreAfter = evaluateFeedbackQuality(testAnswers[i], feedbackAfter);

            // 4. 결과 출력
            System.out.println("\n┌─ 개선 전 피드백 평가 ─┐");
            System.out.println(scoreBefore);
            System.out.println("\n┌─ 개선 후 피드백 평가 ─┐");
            System.out.println(scoreAfter);

            double improvement = scoreAfter.overallScore - scoreBefore.overallScore;
            System.out.printf("\n✅ 개선율: %.1f점 (%.1f%%)%n",
                improvement,
                (improvement / scoreBefore.overallScore) * 100
            );
            System.out.println("─".repeat(80));
        }
    }

    /**
     * 피드백 품질을 LLM으로 평가
     */
    private QualityScore evaluateFeedbackQuality(String originalAnswer, String feedback) {
        String evaluationPrompt = String.format("""
            당신은 면접 피드백의 품질을 평가하는 전문가입니다.

            [원본 면접 대화]
            %s

            [제공된 피드백]
            %s

            다음 5가지 기준으로 피드백 품질을 평가해주세요 (각 0-100점):

            1. **구체성**: 피드백이 구체적인가? "좋다", "부족하다" 같은 막연한 표현이 아닌가?
               - 90-100점: 숫자, 예시, 구체적 개선 방법 제시
               - 50-69점: 일부 구체적이나 막연한 부분 많음
               - 0-29점: 대부분 추상적

            2. **실행 가능성**: 면접자가 실제로 적용할 수 있는 조언인가?
               - 90-100점: "수치 3개 추가", "STAR 구조 사용" 등 명확한 액션
               - 50-69점: 실행 방법이 다소 불명확
               - 0-29점: "더 잘하세요" 같은 추상적 조언

            3. **정확성**: 원본 답변에 대한 평가가 정확한가?
               - 90-100점: 답변의 강약점을 정확히 파악
               - 50-69점: 일부 부정확한 평가 포함
               - 0-29점: 원본과 무관하거나 틀린 평가

            4. **균형성**: 장점과 단점을 균형있게 제시했는가?
               - 90-100점: 강점 2-3개, 약점 2-3개 균형있게 제시
               - 50-69점: 한쪽으로 치우침
               - 0-29점: 장점만 또는 단점만

            5. **전문성**: 전문가다운 피드백인가?
               - 90-100점: STAR, 루브릭 등 전문 용어, 체계적 분석
               - 50-69점: 일반적 수준
               - 0-29점: 비전문적

            JSON 형식으로만 답변:
            {
              "specificity": 점수,
              "actionability": 점수,
              "accuracy": 점수,
              "balance": 점수,
              "professionalism": 점수,
              "overallScore": 평균점수,
              "reasoning": "1-2문장으로 핵심 평가 이유"
            }
            """, originalAnswer, feedback);

        // Gemini API 호출
        String response = callGeminiAPI(evaluationPrompt);
        return parseQualityScore(response);
    }

    /**
     * 개선 전 프롬프트 (간단한 버전)
     */
    private String generateFeedbackOldPrompt(String conversation) {
        String prompt = String.format("""
            당신은 면접관입니다. 다음 면접을 평가해주세요.

            [면접 대화]
            %s

            다음 항목을 각각 100점 만점으로 평가하고 피드백을 제공해주세요:
            1. 적합성
            2. 구체성
            3. 논리성
            4. 진정성
            5. 차별성

            JSON 형식으로 답변해주세요.
            """, conversation);

        return callGeminiAPI(prompt);
    }

    /**
     * 개선 후 프롬프트 (Few-shot + 루브릭)
     */
    private String generateFeedbackNewPrompt(String conversation) {
        String prompt = String.format("""
            당신은 삼성, LG, 네이버, 카카오 등 대기업 면접을 10년 이상 진행한 전문 면접관입니다.

            [우수 답변 예시 1 - 90점대]
            질문: "팀 프로젝트에서 갈등을 해결한 경험이 있나요?"
            답변: "백엔드 개발 중 API 설계 방식으로 팀원과 의견 충돌이 있었습니다. 저는 RESTful 방식을 주장했고 동료는 GraphQL을 선호했습니다. 양측 장단점을 문서화하고, 프로토타입을 각각 2일간 개발해 성능 테스트를 진행했습니다. 결과적으로 우리 서비스의 단순한 CRUD 특성상 RESTful이 더 적합하다는 데이터를 제시하여 합의했고, 이후 GraphQL의 장점은 차기 프로젝트에 반영하기로 했습니다."

            평가: 적합성 95점, 구체성 98점, 논리성 92점, 진정성 90점, 차별성 88점
            이유: 구체적 상황, 정량적 근거(2일간), 해결 과정, 후속 조치까지 완벽. 실제 경험에서 나온 디테일이 풍부함.

            [보통 답변 예시 - 50-60점대]
            질문: "팀 프로젝트에서 갈등을 해결한 경험이 있나요?"
            답변: "네, 팀 프로젝트에서 의견이 달라서 서로 토론을 통해 해결했습니다. 각자 의견을 들어보고 합의점을 찾아 프로젝트를 성공적으로 마쳤습니다."

            평가: 적합성 60점, 구체성 30점, 논리성 50점, 진정성 45점, 차별성 35점
            이유: 질문에는 맞지만 추상적이고 구체성 부족. 누구나 할 수 있는 답변으로 차별성 없음.

            [면접 대화 내역]
            %s

            **구체성 평가 기준**
            - 90-100점: 수치, 날짜, 고유명사, 기술명 등 구체적 요소 5개 이상 + 상세한 과정 설명
            - 70-89점: 구체적 사례 3-4개 + 과정 설명
            - 50-69점: 구체적 사례 1-2개 포함
            - 30-49점: 대부분 추상적이나 일부 구체성
            - 0-29점: 완전히 추상적

            위 기준과 예시를 참고하여 엄격하게 평가하고, 구체적이고 실행 가능한 피드백을 제공해주세요.
            JSON 형식으로 답변해주세요.
            """, conversation);

        return callGeminiAPI(prompt);
    }

    /**
     * Gemini API 호출
     */
    private String callGeminiAPI(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + geminiApiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.4,
                "topP", 0.8,
                "topK", 40,
                "maxOutputTokens", 2048
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = (String) parts.get(0).get("text");

            // JSON 추출
            text = text.replaceAll("```json\\n?", "").replaceAll("```", "").trim();
            int startIdx = text.indexOf("{");
            int endIdx = text.lastIndexOf("}");
            if (startIdx != -1 && endIdx != -1) {
                return text.substring(startIdx, endIdx + 1);
            }
            return text;

        } catch (Exception e) {
            System.err.println("API 호출 실패: " + e.getMessage());
            return "{}";
        }
    }

    /**
     * JSON을 QualityScore 객체로 파싱
     */
    private QualityScore parseQualityScore(String json) {
        try {
            // 간단한 JSON 파싱 (실제로는 Jackson 사용 권장)
            double specificity = extractScore(json, "specificity");
            double actionability = extractScore(json, "actionability");
            double accuracy = extractScore(json, "accuracy");
            double balance = extractScore(json, "balance");
            double professionalism = extractScore(json, "professionalism");
            double overall = extractScore(json, "overallScore");
            String reasoning = extractString(json, "reasoning");

            return new QualityScore(specificity, actionability, accuracy, balance, professionalism, overall, reasoning);
        } catch (Exception e) {
            return new QualityScore(0, 0, 0, 0, 0, 0, "파싱 실패");
        }
    }

    private double extractScore(String json, String key) {
        try {
            int idx = json.indexOf("\"" + key + "\"");
            if (idx == -1) return 0;
            int colonIdx = json.indexOf(":", idx);
            int commaIdx = json.indexOf(",", colonIdx);
            if (commaIdx == -1) commaIdx = json.indexOf("}", colonIdx);
            String value = json.substring(colonIdx + 1, commaIdx).trim();
            return Double.parseDouble(value);
        } catch (Exception e) {
            return 0;
        }
    }

    private String extractString(String json, String key) {
        try {
            int idx = json.indexOf("\"" + key + "\"");
            if (idx == -1) return "";
            int colonIdx = json.indexOf(":", idx);
            int startQuote = json.indexOf("\"", colonIdx);
            int endQuote = json.indexOf("\"", startQuote + 1);
            return json.substring(startQuote + 1, endQuote);
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * 품질 점수 객체
     */
    static class QualityScore {
        double specificity;
        double actionability;
        double accuracy;
        double balance;
        double professionalism;
        double overallScore;
        String reasoning;

        public QualityScore(double specificity, double actionability, double accuracy,
                          double balance, double professionalism, double overallScore, String reasoning) {
            this.specificity = specificity;
            this.actionability = actionability;
            this.accuracy = accuracy;
            this.balance = balance;
            this.professionalism = professionalism;
            this.overallScore = overallScore;
            this.reasoning = reasoning;
        }

        @Override
        public String toString() {
            return String.format("""
                구체성:       %.1f점
                실행가능성:   %.1f점
                정확성:       %.1f점
                균형성:       %.1f점
                전문성:       %.1f점
                ─────────────────────
                종합 점수:    %.1f점

                평가 이유: %s
                """,
                specificity, actionability, accuracy, balance, professionalism,
                overallScore, reasoning
            );
        }
    }
}
