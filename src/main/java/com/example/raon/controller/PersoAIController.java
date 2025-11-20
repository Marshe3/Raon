package com.example.raon.controller;

import com.example.raon.dto.ConfigurationBundle;
import com.example.raon.service.PersoAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * PersoAI 백오피스 API 컨트롤러
 */
@RestController
@RequestMapping("/api/persoai")
public class PersoAIController {

    private static final Logger logger = LoggerFactory.getLogger(PersoAIController.class);

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    private final PersoAIService persoAIService;

    public PersoAIController(PersoAIService persoAIService) {
        this.persoAIService = persoAIService;
    }

    /**
     * PersoAI API 자격증명 반환
     * GET /raon/api/persoai/credentials
     */
    @GetMapping("/credentials")
    public ResponseEntity<Map<String, String>> getCredentials() {
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

    /**
     * 전체 설정 로드
     * GET /raon/api/persoai/configurations
     * 
     * 백오피스에서 사용하는 메인 엔드포인트
     */
    @GetMapping("/configurations")
    public ResponseEntity<ConfigurationBundle> getAllConfigurations() {
        try {
            logger.info("📦 설정 로드 요청 받음");
            
            ConfigurationBundle config = persoAIService.loadAllConfigurations();
            
            logger.info("✅ 설정 로드 성공 - Prompts: {}, Documents: {}, Backgrounds: {}, Styles: {}, LLMs: {}, TTS: {}",
                config.getPrompts().size(),
                config.getDocuments().size(),
                config.getBackgroundImages().size(),
                config.getModelStyles().size(),
                config.getLlmModels().size(),
                config.getTtsModels().size()
            );
            
            return ResponseEntity.ok(config);
            
        } catch (Exception e) {
            logger.error("❌ 설정 로드 실패", e);
            throw new RuntimeException("설정 로드 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 헬스 체크 엔드포인트
     * GET /raon/api/persoai/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "PersoAI API");
        return ResponseEntity.ok(response);
    }
}