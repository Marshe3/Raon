// src/main/java/com/example/raon/controller/LearningHistoryController.java
package com.example.raon.controller;

import com.example.raon.dto.LearningHistoryResponse;
import com.example.raon.service.LearningHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/raon/api/learning-history")
public class LearningHistoryController {

    private final LearningHistoryService learningHistoryService;

    @GetMapping
    public List<LearningHistoryResponse> getMyHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // authentication.getName()은 userId를 String으로 반환
        Long userId = Long.parseLong(authentication.getName());
        log.info("학습 기록 조회 요청 - userId: {}", userId);

        return learningHistoryService.getMyHistory(userId);
    }
}
