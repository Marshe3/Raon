// src/main/java/com/example/raon/repository/LearningHistoryRepository.java
package com.example.raon.repository;

import com.example.raon.domain.LearningHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningHistoryRepository extends JpaRepository<LearningHistory, Long> {

    // 특정 사용자의 학습 기록 조회 (최신순)
    List<LearningHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 특정 사용자의 평균 점수
    @Query("SELECT AVG(lh.score) FROM LearningHistory lh WHERE lh.userId = :userId")
    Double findAverageScoreByUserId(@Param("userId") Long userId);

    // 특정 사용자의 최고 점수
    @Query("SELECT MAX(lh.score) FROM LearningHistory lh WHERE lh.userId = :userId")
    Integer findMaxScoreByUserId(@Param("userId") Long userId);

    // 특정 사용자의 최저 점수
    @Query("SELECT MIN(lh.score) FROM LearningHistory lh WHERE lh.userId = :userId")
    Integer findMinScoreByUserId(@Param("userId") Long userId);

    // 특정 사용자의 총 면접 횟수
    Long countByUserId(Long userId);
}
