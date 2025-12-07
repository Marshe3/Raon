package com.example.raon.service;

import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * RAG를 위한 우수 자소서 예시 저장소
 */
@Service
public class CoverLetterExampleService {

    @Data
    public static class CoverLetterExample {
        private String jobCategory;
        private String content;
        private List<String> keywords;
        private int score;

        public CoverLetterExample(String jobCategory, String content, List<String> keywords, int score) {
            this.jobCategory = jobCategory;
            this.content = content;
            this.keywords = keywords;
            this.score = score;
        }
    }

    private final List<CoverLetterExample> examples = new ArrayList<>();

    public CoverLetterExampleService() {
        initExamples();
    }

    private void initExamples() {
        // 백엔드 우수 예시
        examples.add(new CoverLetterExample(
            "백엔드",
            "대학교 2학년 때 진행한 '스마트 농장 관리 시스템' 프로젝트는 제 개발 인생의 전환점이었습니다. " +
            "농촌 지역의 인력 부족 문제를 해결하기 위해 IoT 센서와 AI 기반 작물 상태 분석 시스템을 개발했고, " +
            "실제 농장에 3개월간 시범 적용한 결과 인건비를 30%, 작물 수확량을 15% 향상시켰습니다.\n\n" +
            "개발 과정에서 가장 큰 어려움은 농장 환경의 불안정한 네트워크 연결이었습니다. 이를 해결하기 위해 " +
            "오프라인 모드에서도 작동하는 로컬 캐싱 시스템을 구축했고, 데이터 동기화 충돌을 방지하는 " +
            "CRDT 알고리즘을 적용했습니다.",
            Arrays.asList("iot", "ai", "캐싱", "문제해결", "spring", "java"),
            95
        ));

        examples.add(new CoverLetterExample(
            "백엔드",
            "인턴십 기간 중 레거시 결제 시스템의 성능 문제를 해결한 경험은 제게 실무 개발자로서의 자신감을 심어주었습니다. " +
            "블랙 프라이데이를 앞두고 초당 100건의 결제 요청만 처리 가능한 시스템을 1,000건으로 개선해야 하는 미션을 받았습니다.\n\n" +
            "병목 지점 분석을 위해 APM 툴과 DB 슬로우 쿼리 로그를 분석했고, N+1 쿼리 문제와 동기 처리 방식이 주요 원인임을 파악했습니다. " +
            "JPA Fetch Join으로 쿼리 최적화, Redis 기반 비동기 큐 도입, 커넥션 풀 튜닝을 진행하여 TPS를 1,200까지 향상시켰습니다.",
            Arrays.asList("성능최적화", "redis", "jpa", "spring", "mysql", "java"),
            93
        ));

        // 프론트엔드 우수 예시
        examples.add(new CoverLetterExample(
            "프론트엔드",
            "대학교 3학년 때 시각장애인 학우가 학교 LMS를 사용하지 못하는 모습을 보고 웹 접근성에 눈을 뜨게 되었습니다. " +
            "졸업 프로젝트로 '모두를 위한 학습 플랫폼'을 기획했고, WCAG 2.1 AA 등급 달성을 목표로 개발했습니다.\n\n" +
            "ARIA 라벨과 Live Region을 활용하여 실시간 채팅, 알림 등을 음성으로 전달하도록 구현했고, " +
            "키보드만으로 모든 기능에 접근 가능하도록 Tab Index와 Focus Trap을 구현했습니다. " +
            "완성된 플랫폼은 한국웹접근성인증마크를 획득했습니다.",
            Arrays.asList("react", "웹접근성", "aria", "javascript", "사용자경험"),
            92
        ));

        // AI/데이터 우수 예시
        examples.add(new CoverLetterExample(
            "AI",
            "핀테크 스타트업 인턴 시절, 하루 평균 20건의 부정 거래로 인한 손실이 발생하고 있었습니다. " +
            "기존 룰 기반 시스템은 오탐률이 40%에 달해 저는 머신러닝 기반 탐지 시스템 개발을 제안했습니다.\n\n" +
            "6개월간의 거래 데이터 100만 건을 분석하여 피처 엔지니어링을 진행했고, Isolation Forest와 XGBoost를 " +
            "앙상블한 모델을 구축했습니다. 부정 거래 탐지율을 85%로 향상시키고 오탐률은 12%로 낮춰 " +
            "연간 3억원의 비용 절감 효과를 가져왔습니다.",
            Arrays.asList("머신러닝", "python", "xgboost", "데이터분석", "ai"),
            94
        ));

        // 풀스택 우수 예시
        examples.add(new CoverLetterExample(
            "풀스택",
            "코로나19로 비대면 수업이 시작되면서 팀 프로젝트 협업에 어려움을 겪었고, '학생을 위한 실시간 협업 툴'을 개발했습니다. " +
            "Google Docs처럼 여러 명이 동시에 문서를 편집할 수 있는 서비스를 목표로 했습니다.\n\n" +
            "WebSocket 기반 실시간 동기화와 Operational Transformation 알고리즘을 구현했습니다. " +
            "프론트엔드는 React, 백엔드는 Node.js와 Socket.io로 구축했고, Redis Pub/Sub으로 메시지 영속성을 확보했습니다. " +
            "학교 동아리 200명이 베타 테스터로 참여했고, 월 평균 500개 문서가 생성되고 있습니다.",
            Arrays.asList("websocket", "react", "nodejs", "redis", "실시간"),
            91
        ));
    }

    /**
     * 직무와 기술 기반으로 관련 예시 검색
     */
    public List<CoverLetterExample> searchRelevant(String position, String skills, int limit) {
        String normalizedPosition = normalizePosition(position);
        List<String> skillKeywords = extractKeywords(skills);

        return examples.stream()
                .map(ex -> new ScoredExample(ex, calculateScore(ex, normalizedPosition, skillKeywords)))
                .filter(s -> s.score > 0)
                .sorted((a, b) -> Integer.compare(b.score, a.score))
                .limit(limit)
                .map(s -> s.example)
                .collect(Collectors.toList());
    }

    @Data
    private static class ScoredExample {
        private final CoverLetterExample example;
        private final int score;
    }

    private String normalizePosition(String pos) {
        if (pos == null) return "";
        String lower = pos.toLowerCase();

        if (lower.contains("백엔드") || lower.contains("backend") || lower.contains("서버"))
            return "백엔드";
        if (lower.contains("프론트엔드") || lower.contains("frontend") || lower.contains("프론트"))
            return "프론트엔드";
        if (lower.contains("풀스택") || lower.contains("full"))
            return "풀스택";
        if (lower.contains("ai") || lower.contains("머신") || lower.contains("데이터"))
            return "AI";

        return "";
    }

    private List<String> extractKeywords(String skills) {
        if (skills == null || skills.isEmpty()) return Collections.emptyList();

        return Arrays.stream(skills.toLowerCase().split("[,\\s;]+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private int calculateScore(CoverLetterExample ex, String position, List<String> skillKeywords) {
        int score = 0;

        // 직무 매칭 (50점)
        if (!position.isEmpty() && ex.getJobCategory().equals(position)) {
            score += 50;
        }

        // 스킬 매칭 (각 10점)
        for (String skill : skillKeywords) {
            for (String keyword : ex.getKeywords()) {
                if (keyword.contains(skill) || skill.contains(keyword)) {
                    score += 10;
                    break;
                }
            }
        }

        return score;
    }
}
