package com.example.raon.service;

import com.example.raon.domain.ChatRoom;
import com.example.raon.domain.InterviewFeedback;
import com.example.raon.domain.User;
import com.example.raon.repository.ChatRoomRepository;
import com.example.raon.repository.InterviewFeedbackRepository;
import com.example.raon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewFeedbackService {

    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    /**
     * 면접 피드백 저장
     */
    @Transactional
    public InterviewFeedback saveFeedback(Long userId, Long chatId, BigDecimal score, String feedbackSummary) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        ChatRoom chatRoom = null;
        if (chatId != null) {
            chatRoom = chatRoomRepository.findById(chatId).orElse(null);
        }

        InterviewFeedback feedback = InterviewFeedback.builder()
                .user(user)
                .chatRoom(chatRoom)
                .score(score)
                .feedbackSummary(feedbackSummary)
                .interviewDate(LocalDateTime.now())
                .build();

        InterviewFeedback saved = interviewFeedbackRepository.save(feedback);
        log.info("면접 피드백 저장 완료 - userId: {}, score: {}", userId, score);

        return saved;
    }

    /**
     * 특정 사용자의 모든 면접 피드백 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<InterviewFeedback> getFeedbacksByUserId(Long userId) {
        return interviewFeedbackRepository.findByUser_UserIdOrderByInterviewDateDesc(userId);
    }

    /**
     * 특정 사용자의 기간별 면접 피드백 조회
     */
    @Transactional(readOnly = true)
    public List<InterviewFeedback> getFeedbacksByUserIdAndDateRange(Long userId, LocalDateTime startDate) {
        return interviewFeedbackRepository.findByUserIdAndDateRange(userId, startDate);
    }

    /**
     * 특정 채팅방의 피드백 조회
     */
    @Transactional(readOnly = true)
    public Optional<InterviewFeedback> getFeedbackByChatId(Long chatId) {
        List<InterviewFeedback> feedbacks = interviewFeedbackRepository.findByChatRoom_Id(chatId);
        return feedbacks.isEmpty() ? Optional.empty() : Optional.of(feedbacks.get(0));
    }

    /**
     * 특정 사용자의 평균 점수 계산
     */
    @Transactional(readOnly = true)
    public BigDecimal getAverageScore(Long userId) {
        List<InterviewFeedback> feedbacks = getFeedbacksByUserId(userId);
        if (feedbacks.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal sum = feedbacks.stream()
                .map(InterviewFeedback::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.divide(BigDecimal.valueOf(feedbacks.size()), 2, RoundingMode.HALF_UP);
    }
}
