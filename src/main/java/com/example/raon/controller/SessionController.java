// src/main/java/com/example/raon/controller/SessionController.java
package com.example.raon.controller;

import com.example.raon.dto.SessionCreateRequest;
import com.example.raon.dto.SessionResponse;
import com.example.raon.service.PersoAISessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final PersoAISessionService sessionService;

    @PostMapping(
        value = "/create",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<SessionResponse> createSession(@RequestBody SessionCreateRequest request) {
        log.info("🚀 세션 생성 요청: {}", request);
        SessionResponse response = sessionService.createSession(request);
        log.info("✅ 세션 생성 성공: {}", response.getSessionId());
        return ResponseEntity.ok(response);
    }
}
