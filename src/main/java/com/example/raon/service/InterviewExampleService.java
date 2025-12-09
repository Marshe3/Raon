package com.example.raon.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

/**
 * 면접 우수 답변 예시 관리 서비스 (RAG)
 * Gemini Embedding API + 벡터 검색
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewExampleService {

    private final GeminiEmbeddingService embeddingService;
    private final VectorSearchService vectorSearchService;

    private final List<InterviewExample> examples = new ArrayList<>();
    private final List<VectorSearchService.VectorItem<InterviewExample>> vectorizedExamples = new ArrayList<>();

    @Data
    public static class InterviewExample {
        private String category;        // 질문 유형 (팀워크, 문제해결, 리더십 등)
        private String question;         // 질문
        private String answer;           // 우수 답변
        private int score;              // 점수 (0-100)
        private String evaluation;      // 평가 이유
        private double[] vector;        // 임베딩 벡터

        public InterviewExample(String category, String question, String answer,
                              int score, String evaluation) {
            this.category = category;
            this.question = question;
            this.answer = answer;
            this.score = score;
            this.evaluation = evaluation;
        }
    }

    @PostConstruct
    public void init() {
        log.info("🚀 면접 우수 답변 예시 초기화 시작...");

        // 팀워크/협업 관련 우수 답변
        examples.add(new InterviewExample(
                "팀워크/협업",
                "팀 프로젝트에서 갈등을 해결한 경험이 있나요?",
                "백엔드 개발 중 API 설계 방식으로 팀원과 의견 충돌이 있었습니다. 저는 RESTful 방식을 주장했고 동료는 GraphQL을 선호했습니다. 양측 장단점을 문서화하고, 프로토타입을 각각 2일간 개발해 성능 테스트를 진행했습니다. 결과적으로 우리 서비스의 단순한 CRUD 특성상 RESTful이 더 적합하다는 데이터를 제시하여 합의했고, 이후 GraphQL의 장점은 차기 프로젝트에 반영하기로 했습니다.",
                95,
                "적합성 95점, 구체성 98점, 논리성 92점, 진정성 90점, 차별성 88점. 구체적 상황, 정량적 근거(2일간), 해결 과정, 후속 조치까지 완벽. 실제 경험에서 나온 디테일이 풍부함."
        ));

        examples.add(new InterviewExample(
                "팀워크/협업",
                "팀에서 어려운 동료와 함께 일한 경험이 있나요?",
                "프론트엔드 팀 프로젝트에서 한 팀원이 커뮤니케이션에 소극적이어서 진행이 지연됐습니다. 저는 1:1 면담을 통해 해당 팀원이 React Hooks에 자신이 없어 의견을 내지 못한다는 것을 알았습니다. 이후 매일 30분씩 페어 프로그래밍을 진행하며 Hooks 사용법을 함께 학습했고, 2주 후에는 자발적으로 의견을 제시하기 시작했습니다. 최종적으로 프로젝트는 예정보다 3일 일찍 완료되었습니다.",
                92,
                "적합성 95점, 구체성 92점, 논리성 90점, 진정성 94점, 차별성 89점. 문제 파악 → 해결 방안 → 결과까지 논리적. 페어 프로그래밍이라는 구체적 해결책 제시."
        ));

        // 실패/극복 관련 우수 답변
        examples.add(new InterviewExample(
                "실패/극복",
                "본인의 가장 큰 실패 경험과 그로부터 배운 점을 말해주세요.",
                "대학교 3학년 때 팀 프로젝트에서 리더를 맡았는데, 제가 코드 리뷰를 소홀히 하면서 마감 2일 전 치명적인 버그가 발견됐습니다. 결국 밤을 새워 수정했지만 발표 퀄리티가 떨어졌고 B학점을 받았습니다. 이후로는 매일 코드 리뷰 시간을 30분씩 확보하고, CI/CD 파이프라인에 자동 테스트를 도입했습니다. 현재 인턴십에서는 이 경험 덕분에 버그를 사전에 3건이나 방지했습니다.",
                90,
                "적합성 90점, 구체성 85점, 논리성 88점, 진정성 92점, 차별성 80점. 솔직한 실패 고백, 구체적 개선 행동, 실제 성과까지 연결. 진정성이 돋보임."
        ));

        examples.add(new InterviewExample(
                "실패/극복",
                "프로젝트가 실패한 경험이 있나요?",
                "스타트업 동아리에서 진행한 앱 개발 프로젝트가 출시 3개월 만에 사용자가 50명밖에 안 돼서 중단됐습니다. 원인을 분석한 결과, 사용자 니즈 파악 없이 기능부터 개발한 것이 문제였습니다. 이후 프로젝트에서는 MVP 개발 전 최소 20명의 잠재 사용자를 인터뷰하고, 프로토타입으로 검증 후 개발하는 린 스타트업 방법론을 적용했습니다. 이렇게 시작한 다음 프로젝트는 출시 1개월 만에 500명의 사용자를 확보했습니다.",
                88,
                "적합성 92점, 구체성 88점, 논리성 90점, 진정성 87점, 차별성 84점. 실패 원인 분석 → 개선 방법론 도입 → 성과 달성의 흐름이 명확."
        ));

        // 문제해결 관련 우수 답변
        examples.add(new InterviewExample(
                "문제해결",
                "어려운 기술적 문제를 해결한 경험을 말해주세요.",
                "쇼핑몰 프로젝트에서 결제 API 응답 시간이 평균 3초로 느려서 사용자 이탈률이 높았습니다. 프로파일링 결과 DB 쿼리가 N+1 문제를 일으킨다는 것을 발견했습니다. JPA Fetch Join과 Redis 캐싱을 도입하여 응답 시간을 0.5초로 84% 단축시켰고, 결제 전환율이 23%에서 41%로 증가했습니다. 이 과정에서 성능 최적화와 캐싱 전략의 중요성을 체감했습니다.",
                93,
                "적합성 94점, 구체성 95점, 논리성 92점, 진정성 91점, 차별성 90점. 정량적 지표(3초→0.5초, 23%→41%), 구체적 해결책, 비즈니스 임팩트 명확."
        ));

        examples.add(new InterviewExample(
                "문제해결",
                "예상치 못한 장애를 해결한 경험이 있나요?",
                "인턴십 중 프로덕션 서버가 새벽 2시에 다운되어 즉시 대응했습니다. 로그 분석 결과 메모리 누수가 원인이었고, 특정 API 엔드포인트에서 컬렉션 객체가 해제되지 않는 것을 발견했습니다. 임시로 서버를 재시작하고 해당 엔드포인트를 비활성화한 후, 다음 날 WeakHashMap으로 교체하여 근본적으로 해결했습니다. 이후 메모리 모니터링 알림을 설정하여 재발을 방지했습니다.",
                91,
                "적합성 93점, 구체성 90점, 논리성 92점, 진정성 89점, 차별성 87점. 긴급 상황 대응 → 임시 조치 → 근본 해결 → 재발 방지의 완벽한 흐름."
        ));

        // 리더십 관련 우수 답변
        examples.add(new InterviewExample(
                "리더십",
                "팀을 이끌어본 경험이 있나요?",
                "오픈소스 프로젝트에 5명의 팀원을 모집하여 6개월간 리드했습니다. 매주 월요일 스프린트 계획, 금요일 회고를 진행했고, GitHub Projects로 작업을 투명하게 관리했습니다. 초반에는 기여도가 불균등했지만, 각자의 강점을 파악하여 백엔드/프론트엔드/문서화로 역할을 분담했습니다. 최종적으로 프로젝트는 GitHub Star 120개를 받았고, 2명의 팀원은 이 경험으로 인턴십에 합격했습니다.",
                94,
                "적합성 96점, 구체성 94점, 논리성 93점, 진정성 92점, 차별성 91점. 구체적 리더십 활동, 정량적 성과, 팀원 성장까지 고려한 리더십."
        ));

        // 기술/프로젝트 관련 우수 답변
        examples.add(new InterviewExample(
                "기술/프로젝트",
                "가장 자랑스러운 프로젝트를 소개해주세요.",
                "블로그 플랫폼을 개발하여 MAU 1,000명을 달성했습니다. Spring Boot + React로 구현했으며, 핵심 기능은 Markdown 에디터와 실시간 검색입니다. Elasticsearch를 도입하여 검색 속도를 1.2초에서 0.1초로 개선했고, GitHub Actions로 CI/CD를 구축하여 배포 시간을 30분에서 5분으로 단축했습니다. 사용자 피드백을 분석하여 다크모드, 코드 하이라이팅 등 15개 기능을 추가했고, 이 과정에서 풀스택 개발 역량을 크게 향상시켰습니다.",
                96,
                "적합성 97점, 구체성 98점, 논리성 94점, 진정성 95점, 차별성 93점. 기술 스택, 정량적 성과, 개선 과정이 매우 구체적."
        ));

        // 자기소개/동기 관련 우수 답변
        examples.add(new InterviewExample(
                "자기소개/동기",
                "우리 회사에 지원한 이유는 무엇인가요?",
                "네이버 검색 기술에 큰 관심이 있습니다. 특히 AiRS(AI Recommender System)가 대규모 트래픽에서도 밀리초 단위로 개인화 추천을 제공하는 것에 감명받았습니다. 저는 Elasticsearch로 검색 엔진을 구현한 경험이 있으며, 이를 바탕으로 네이버의 검색 품질 향상에 기여하고 싶습니다. 또한 오픈소스 문화와 기술 블로그를 통해 지속적으로 학습하며 성장하는 개발자가 되고 싶습니다.",
                89,
                "적합성 92점, 구체성 88점, 논리성 87점, 진정성 90점, 차별성 85점. 회사의 구체적 기술 언급, 본인 경험 연결, 성장 의지 표현."
        ));

        // 가치관/윤리 관련 우수 답변
        examples.add(new InterviewExample(
                "가치관/윤리",
                "일과 삶의 균형을 어떻게 유지하나요?",
                "효율적인 시간 관리로 균형을 유지합니다. 업무 시간에는 포모도로 기법으로 집중력을 높이고, 퇴근 후에는 업무 알림을 끄고 운동이나 독서에 집중합니다. 주말에는 사이드 프로젝트나 기술 블로그 작성으로 자기계발하되, 월 1회는 완전히 쉬는 날을 갖습니다. 이렇게 명확한 경계를 설정하니 업무 생산성이 향상되고 번아웃 없이 지속 가능한 성장이 가능했습니다.",
                86,
                "적합성 88점, 구체성 85점, 논리성 86점, 진정성 87점, 차별성 82점. 구체적 방법론(포모도로), 경계 설정, 지속 가능성 강조."
        ));

        log.info("✅ 면접 우수 답변 예시 {}개 로드 완료", examples.size());

        // 벡터화 시작
        log.info("🔄 Gemini Embedding API로 벡터화 시작...");
        try {
            for (int i = 0; i < examples.size(); i++) {
                InterviewExample example = examples.get(i);
                // 질문 + 답변을 합쳐서 임베딩
                String textToEmbed = example.getQuestion() + " " + example.getAnswer();
                double[] vector = embeddingService.getEmbedding(textToEmbed);
                example.setVector(vector);

                vectorizedExamples.add(new VectorSearchService.VectorItem<>(example, vector));

                log.info("  [{}/{}] {} - 벡터화 완료 ({}차원)",
                        i + 1, examples.size(), example.getCategory(), vector.length);

                // API Rate Limit 방지 (요청 간 1초 대기)
                if (i < examples.size() - 1) {
                    Thread.sleep(1000);
                }
            }

            log.info("✅ 벡터화 완료 - {}개 예시가 {}차원 벡터로 변환됨",
                    vectorizedExamples.size(),
                    vectorizedExamples.get(0).getVector().length);

        } catch (Exception e) {
            log.error("❌ 벡터화 실패", e);
            throw new RuntimeException("면접 예시 벡터화 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 질문 텍스트 기반으로 관련 우수 답변 예시 검색 (벡터 검색)
     */
    public List<InterviewExample> searchRelevant(String questionText, int limit) {
        if (questionText == null || questionText.trim().isEmpty()) {
            return examples.stream().limit(limit).toList();
        }

        log.info("🔍 벡터 검색 시작 - 질문: {}", questionText.substring(0, Math.min(50, questionText.length())));

        try {
            // 1. 질문 텍스트를 벡터로 변환
            double[] queryVector = embeddingService.getEmbedding(questionText);
            log.debug("  질문 벡터화 완료 - {}차원", queryVector.length);

            // 2. 벡터 유사도 검색
            List<VectorSearchService.SearchResult<InterviewExample>> searchResults =
                    vectorSearchService.searchTopK(queryVector, vectorizedExamples, limit);

            // 3. 결과 추출
            List<InterviewExample> results = searchResults.stream()
                    .map(VectorSearchService.SearchResult::getData)
                    .toList();

            log.info("✅ 벡터 검색 완료 - {}개 선택됨", results.size());
            for (int i = 0; i < searchResults.size(); i++) {
                VectorSearchService.SearchResult<InterviewExample> result = searchResults.get(i);
                log.info("  [{}] {} (유사도: {:.4f})",
                        i + 1, result.getData().getCategory(), result.getSimilarity());
            }

            return results;

        } catch (Exception e) {
            log.error("❌ 벡터 검색 실패, 키워드 기반 검색으로 폴백", e);
            // 폴백: 단순히 상위 N개 반환
            return examples.stream().limit(limit).toList();
        }
    }
}
