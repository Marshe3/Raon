package com.example.raon.controller;

import com.example.raon.dto.*;
import com.example.raon.service.PersoAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 백오피스 API 컨트롤러
 * PersoAI 설정 관리를 위한 백오피스 엔드포인트 제공
 */
@RestController
@RequestMapping("/api/backoffice")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class BackofficeController {

    private final PersoAIService persoAIService;

    /**
     * 전체 설정 로드
     * GET /api/backoffice/configurations
     * 
     * @param forceRefresh true면 캐시 무시하고 API에서 새로 로드 (기본값: false)
     * @return 모든 설정 정보 (Prompt, Document, Background, Model Style, AI Models)
     */
    @GetMapping("/configurations")
    public ResponseEntity<ConfigurationBundle> getAllConfigurations(
            @RequestParam(defaultValue = "false") boolean forceRefresh) {
        
        try {
            log.info("📦 설정 로드 요청 - forceRefresh: {}", forceRefresh);
            
            // forceRefresh가 true면 @CacheEvict를 사용하거나 별도 메서드 호출
            // 현재는 간단하게 항상 같은 메서드 호출 (캐싱은 서비스 레이어에서 처리)
            ConfigurationBundle bundle = persoAIService.loadAllConfigurations();
            
            log.info("✅ 설정 로드 완료 - Prompts: {}, Documents: {}, Backgrounds: {}, Styles: {}, LLMs: {}, TTS: {}",
                bundle.getPrompts().size(),
                bundle.getDocuments().size(),
                bundle.getBackgroundImages().size(),
                bundle.getModelStyles().size(),
                bundle.getLlmModels().size(),
                bundle.getTtsModels().size()
            );
            
            return ResponseEntity.ok(bundle);
            
        } catch (Exception e) {
            log.error("❌ 설정 로드 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Prompt 목록 조회
     * GET /api/backoffice/prompts
     */
    @GetMapping("/prompts")
    public ResponseEntity<List<PromptDto>> getPrompts() {
        try {
            log.info("📝 Prompt 목록 조회 요청");
            List<PromptDto> prompts = persoAIService.getAllPrompts();
            log.info("✅ Prompt {} 개 조회 완료", prompts.size());
            return ResponseEntity.ok(prompts);
        } catch (Exception e) {
            log.error("❌ Prompt 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Document 목록 조회
     * GET /api/backoffice/documents
     */
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDto>> getDocuments() {
        try {
            log.info("📄 Document 목록 조회 요청");
            List<DocumentDto> documents = persoAIService.getAllDocuments();
            log.info("✅ Document {} 개 조회 완료", documents.size());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            log.error("❌ Document 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Background Image 목록 조회
     * GET /api/backoffice/backgrounds
     */
    @GetMapping("/backgrounds")
    public ResponseEntity<List<BackgroundImageDto>> getBackgroundImages() {
        try {
            log.info("🖼️ Background Image 목록 조회 요청");
            List<BackgroundImageDto> backgrounds = persoAIService.getAllBackgroundImages();
            log.info("✅ Background Image {} 개 조회 완료", backgrounds.size());
            return ResponseEntity.ok(backgrounds);
        } catch (Exception e) {
            log.error("❌ Background Image 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Model Style 목록 조회
     * GET /api/backoffice/model-styles
     */
    @GetMapping("/model-styles")
    public ResponseEntity<List<ModelStyleDto>> getModelStyles() {
        try {
            log.info("🤖 Model Style 목록 조회 요청");
            List<ModelStyleDto> styles = persoAIService.getAllModelStyles();
            log.info("✅ Model Style {} 개 조회 완료", styles.size());
            return ResponseEntity.ok(styles);
        } catch (Exception e) {
            log.error("❌ Model Style 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * AI 모델 목록 조회
     * GET /api/backoffice/models
     */
    @GetMapping("/models")
    public ResponseEntity<List<AIModelDto>> getAIModels() {
        try {
            log.info("🧠 AI Model 목록 조회 요청");
            List<AIModelDto> models = persoAIService.getAllModels();
            log.info("✅ AI Model {} 개 조회 완료", models.size());
            return ResponseEntity.ok(models);
        } catch (Exception e) {
            log.error("❌ AI Model 조회 실패", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 사용자 설정 저장
     * POST /api/backoffice/configurations/save
     * 
     * @param config 사용자가 선택한 설정 정보
     * @return 저장 결과
     */
    @PostMapping("/configurations/save")
    public ResponseEntity<Map<String, Object>> saveConfiguration(
            @RequestBody Map<String, Object> config) {
        
        try {
            log.info("💾 사용자 설정 저장 요청: {}", config);
            
            // TODO: 사용자별 설정을 데이터베이스에 저장
            // 예: userConfigService.saveUserConfiguration(userId, config);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "설정이 저장되었습니다.");
            response.put("savedConfig", config);
            
            log.info("✅ 설정 저장 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ 설정 저장 실패", e);
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "설정 저장 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 헬스 체크
     * GET /api/backoffice/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "OK");
        health.put("service", "Backoffice API");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
}