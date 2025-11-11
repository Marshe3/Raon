package com.example.raon.controller;

import com.example.raon.service.PersoAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 디버그용 컨트롤러
 * PersoAI API의 실제 응답을 확인하기 위한 엔드포인트
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class DebugController {

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final PersoAIService persoAIService;

    /**
     * API 엔드포인트별 원본 응답 확인
     */
    @GetMapping("/raw/{endpoint}")
    public ResponseEntity<Map<String, Object>> getRawResponse(@PathVariable String endpoint) {
        try {
            String url = apiServer + "/api/v1/" + endpoint + "/";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("PersoLive-APIKey", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            log.info("🔍 디버그 요청: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("status", response.getStatusCode());
            result.put("body", response.getBody());
            result.put("headers", response.getHeaders());
            
            log.info("✅ 응답: {}", response.getBody());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ 디버그 요청 실패: {}", endpoint, e);
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("endpoint", endpoint);
            
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 모든 엔드포인트 테스트
     */
    @GetMapping("/test-all")
    public ResponseEntity<Map<String, Object>> testAllEndpoints() {
        Map<String, Object> results = new HashMap<>();
        
        try {
            // 1. Prompts
            try {
                results.put("prompts_count", persoAIService.getAllPrompts().size());
                results.put("prompts_status", "OK");
            } catch (Exception e) {
                results.put("prompts_status", "ERROR: " + e.getMessage());
            }
            
            // 2. Documents
            try {
                results.put("documents_count", persoAIService.getAllDocuments().size());
                results.put("documents_status", "OK");
            } catch (Exception e) {
                results.put("documents_status", "ERROR: " + e.getMessage());
            }
            
            // 3. Background Images
            try {
                results.put("backgrounds_count", persoAIService.getAllBackgroundImages().size());
                results.put("backgrounds_status", "OK");
            } catch (Exception e) {
                results.put("backgrounds_status", "ERROR: " + e.getMessage());
            }
            
            // 4. Model Styles
            try {
                results.put("model_styles_count", persoAIService.getAllModelStyles().size());
                results.put("model_styles_status", "OK");
            } catch (Exception e) {
                results.put("model_styles_status", "ERROR: " + e.getMessage());
            }
            
            // 5. AI Models
            try {
                results.put("models_count", persoAIService.getAllModels().size());
                results.put("models_status", "OK");
            } catch (Exception e) {
                results.put("models_status", "ERROR: " + e.getMessage());
            }
            
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            results.put("overall_error", e.getMessage());
            return ResponseEntity.status(500).body(results);
        }
    }

    /**
     * 특정 엔드포인트의 파싱된 결과 확인
     */
    @GetMapping("/parsed/{type}")
    public ResponseEntity<?> getParsedData(@PathVariable String type) {
        try {
            switch (type) {
                case "prompts":
                    return ResponseEntity.ok(persoAIService.getAllPrompts());
                case "documents":
                    return ResponseEntity.ok(persoAIService.getAllDocuments());
                case "backgrounds":
                    return ResponseEntity.ok(persoAIService.getAllBackgroundImages());
                case "model-styles":
                    return ResponseEntity.ok(persoAIService.getAllModelStyles());
                case "models":
                    return ResponseEntity.ok(persoAIService.getAllModels());
                default:
                    return ResponseEntity.badRequest().body("Unknown type: " + type);
            }
        } catch (Exception e) {
            log.error("❌ 파싱 실패: {}", type, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", type);
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * API 서버 설정 확인
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("apiServer", apiServer);
        config.put("apiKeySet", apiKey != null && !apiKey.isEmpty() ? "YES" : "NO");
        config.put("apiKeyLength", apiKey != null ? String.valueOf(apiKey.length()) : "0");
        return ResponseEntity.ok(config);
    }
}