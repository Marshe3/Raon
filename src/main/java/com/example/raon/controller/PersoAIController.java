package com.example.raon.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/persoai")
@CrossOrigin(origins = "*")
public class PersoAIController {

    private static final Logger logger = LoggerFactory.getLogger(PersoAIController.class);

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    /**
     * PersoAI API 자격증명 반환
     * GET /api/persoai/credentials
     */
    @GetMapping("/credentials")
    public ResponseEntity<Object> getCredentials() {
        try {
            logger.info("API 자격증명 요청 받음");

            Map<String, String> credentials = new HashMap<>();
            credentials.put("apiServer", apiServer);
            credentials.put("apiKey", apiKey);

            logger.info("API 자격증명 반환: apiServer={}", apiServer);
            return ResponseEntity.ok(credentials);
        } catch (Exception e) {
            logger.error("API 자격증명 조회 실패", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "자격증명 조회 실패");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
