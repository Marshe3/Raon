package com.example.raon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 면접 피드백 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedbackResponse {

    /**
     * 전체 점수 (0.00 ~ 100.00)
     */
    private BigDecimal overallScore;

    /**
     * 섹션별 평가
     */
    private List<SectionFeedback> sections;

    /**
     * 전체 평가 요약
     */
    private String summary;

    /**
     * 면접자의 강점
     */
    private List<String> strengths;

    /**
     * 면접자의 단점/개선점
     */
    private List<String> weaknesses;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SectionFeedback {
        /**
         * 섹션 이름 (적합성, 구체성, 논리성, 진정성, 자료성)
         */
        private String title;

        /**
         * 섹션 점수 (0 ~ 20점)
         */
        private BigDecimal score;

        /**
         * 평가 기준 설명
         */
        private String criteria;

        /**
         * 평가 내용
         */
        private String feedback;
    }
}
