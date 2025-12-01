package com.example.raon.controller;

import com.example.raon.domain.InterviewFeedback;
import com.example.raon.domain.User;
import com.example.raon.service.InterviewFeedbackService;
import com.example.raon.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
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
    private final UserService userService;

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

            // authentication.getName()은 userId를 String으로 반환
            Long userId = Long.parseLong(authentication.getName());
            log.info("면접 피드백 조회 요청 - userId: {}", userId);

            List<InterviewFeedback> feedbacks = interviewFeedbackService.getFeedbacksByUserId(userId);

            // DTO로 변환하여 응답
            List<Map<String, Object>> response = feedbacks.stream()
                    .map(feedback -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("feedbackId", feedback.getFeedbackId());
                        map.put("score", feedback.getScore());
                        map.put("feedbackSummary", feedback.getFeedbackSummary() != null ? feedback.getFeedbackSummary() : "");
                        map.put("interviewDate", feedback.getInterviewDate().toString());
                        map.put("chatId", feedback.getChatRoom() != null ? feedback.getChatRoom().getId() : null);
                        map.put("interviewType", feedback.getInterviewType() != null ? feedback.getInterviewType() : "일반 면접");
                        return map;
                    })
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

            // authentication.getName()은 userId를 String으로 반환
            Long userId = Long.parseLong(authentication.getName());
            log.info("기간별 면접 피드백 조회 요청 - userId: {}, days: {}", userId, days);

            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<InterviewFeedback> feedbacks = interviewFeedbackService.getFeedbacksByUserIdAndDateRange(userId, startDate);

            List<Map<String, Object>> response = feedbacks.stream()
                    .map(feedback -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("feedbackId", feedback.getFeedbackId());
                        map.put("score", feedback.getScore());
                        map.put("feedbackSummary", feedback.getFeedbackSummary() != null ? feedback.getFeedbackSummary() : "");
                        map.put("interviewDate", feedback.getInterviewDate().toString());
                        return map;
                    })
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

            // authentication.getName()은 userId를 String으로 반환
            Long userId = Long.parseLong(authentication.getName());
            log.info("평균 점수 조회 요청 - userId: {}", userId);

            var averageScore = interviewFeedbackService.getAverageScore(userId);

            return ResponseEntity.ok(Map.of("averageScore", averageScore));

        } catch (Exception e) {
            log.error("평균 점수 조회 중 오류", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
