// src/main/java/com/example/raon/service/LearningHistoryService.java
package com.example.raon.service;

import com.example.raon.domain.LearningHistory;
import com.example.raon.dto.LearningHistoryResponse;
import com.example.raon.repository.LearningHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningHistoryService {

    private final LearningHistoryRepository learningHistoryRepository;

    @Transactional(readOnly = true)
    public List<LearningHistoryResponse> getMyHistory(Long userId) {
        // 최신순으로 정렬된 사용자의 기록
        List<LearningHistory> list =
                learningHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return list.stream()
                .map(LearningHistoryResponse::from)
                .toList();
    }
}
