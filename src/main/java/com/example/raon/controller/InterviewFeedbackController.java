package com.example.raon.controller;

import com.example.raon.domain.InterviewFeedback;
import com.example.raon.service.InterviewFeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 면접 피드백 조회 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/interview-feedbacks")
@RequiredArgsConstructor
public class InterviewFeedbackController {

    private final InterviewFeedbackService interviewFeedbackService;

    /**
     * 현재 로그인한 사용자의 모든 면접 피드백 조회
     * GET /api/interview-feedbacks
     */
    @GetMapping
    public ResponseEntity<?> getMyFeedbacks() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다"));
            }

            String email = authentication.getName();
            log.info("면접 피드백 조회 요청 - 사용자: {}", email);

            // TODO: email로 userId 조회 필요
            // 임시로 userId = 1로 테스트
            Long userId = 1L;

            List<InterviewFeedback> feedbacks = interviewFeedbackService.getFeedbacksByUserId(userId);

            // DTO로 변환하여 응답
            List<Map<String, Object>> response = feedbacks.stream()
                    .map(feedback -> Map.of(
                            "feedbackId", feedback.getFeedbackId(),
                            "score", feedback.getScore(),
                            "feedbackSummary", feedback.getFeedbackSummary() != null ? feedback.getFeedbackSummary() : "",
                            "interviewDate", feedback.getInterviewDate().toString(),
                            "chatId", feedback.getChatRoom() != null ? feedback.getChatRoom().getId() : null
                    ))
                    .collect(Collectors.toList());

            log.info("면접 피드백 조회 성공 - 개수: {}", response.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("면접 피드백 조회 중 오류", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 특정 기간의 면접 피드백 조회
     * GET /api/interview-feedbacks/period?days=30
     */
    @GetMapping("/period")
    public ResponseEntity<?> getFeedbacksByPeriod(@RequestParam(defaultValue = "30") int days) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다"));
            }

            Long userId = 1L; // TODO: 실제 userId 조회

            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<InterviewFeedback> feedbacks = interviewFeedbackService.getFeedbacksByUserIdAndDateRange(userId, startDate);

            List<Map<String, Object>> response = feedbacks.stream()
                    .map(feedback -> Map.of(
                            "feedbackId", feedback.getFeedbackId(),
                            "score", feedback.getScore(),
                            "feedbackSummary", feedback.getFeedbackSummary() != null ? feedback.getFeedbackSummary() : "",
                            "interviewDate", feedback.getInterviewDate().toString()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("기간별 면접 피드백 조회 중 오류", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 평균 점수 조회
     * GET /api/interview-feedbacks/average-score
     */
    @GetMapping("/average-score")
    public ResponseEntity<?> getAverageScore() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다"));
            }

            Long userId = 1L; // TODO: 실제 userId 조회

            var averageScore = interviewFeedbackService.getAverageScore(userId);

            return ResponseEntity.ok(Map.of("averageScore", averageScore));

        } catch (Exception e) {
            log.error("평균 점수 조회 중 오류", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
