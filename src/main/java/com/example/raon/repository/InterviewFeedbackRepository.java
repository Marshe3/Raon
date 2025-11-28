package com.example.raon.repository;

import com.example.raon.domain.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {

    /**
     * 특정 사용자의 모든 면접 피드백 조회 (최신순)
     */
    List<InterviewFeedback> findByUser_UserIdOrderByInterviewDateDesc(Long userId);

    /**
     * 특정 사용자의 기간별 면접 피드백 조회
     */
    @Query("SELECT f FROM InterviewFeedback f WHERE f.user.userId = :userId " +
           "AND f.interviewDate >= :startDate ORDER BY f.interviewDate DESC")
    List<InterviewFeedback> findByUserIdAndDateRange(@Param("userId") Long userId,
                                                      @Param("startDate") LocalDateTime startDate);

    /**
     * 특정 채팅방의 피드백 조회
     */
    List<InterviewFeedback> findByChatRoom_Id(Long chatId);
}
