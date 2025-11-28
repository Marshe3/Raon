// src/main/java/com/example/raon/controller/LearningHistoryController.java
package com.example.raon.controller;

import com.example.raon.dto.LearningHistoryResponse;
import com.example.raon.service.LearningHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/raon/api/learning-history")
public class LearningHistoryController {

    private final LearningHistoryService learningHistoryService;

    @GetMapping
    public List<LearningHistoryResponse> getMyHistory(
            // ⚠️ 이 부분은 "다른 컨트롤러에서 로그인 유저 ID 받는 방식"이랑 똑같이 맞춰줘야 함
            // 예: @AuthenticationPrincipal(expression = "id") Long userId
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return learningHistoryService.getMyHistory(userId);
    }
}
