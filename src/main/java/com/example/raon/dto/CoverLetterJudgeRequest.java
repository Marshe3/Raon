package com.example.raon.dto;

import lombok.Data;

/**
 * LLM-as-a-Judge 요청 DTO
 * 원본 자소서와 수정된 자소서를 비교 평가
 */
@Data
public class CoverLetterJudgeRequest {
    private String originalCoverLetter;  // 원본 자기소개서
    private String revisedCoverLetter;   // 수정된 자기소개서
    private String feedbackSummary;      // AI가 제공한 피드백 요약 (선택)
}
