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

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8086"})
public class SessionController {

    private final PersoAISessionService sessionService;

    @PostMapping(
        value = "/create",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> createSession(@RequestBody SessionCreateRequest request) {
        try {
            log.info("🚀 세션 생성 요청: {}", request);
            SessionResponse response = sessionService.createSession(request);
            log.info("✅ 세션 생성 성공: {}", response.getSessionId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ 세션 생성 실패: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "세션 생성 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
