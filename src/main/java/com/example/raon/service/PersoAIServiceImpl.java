package com.example.raon.service;

import com.example.raon.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * PersoAI Platform API 통합 서비스
 * 
 * API 명세서: PERSO_Platform_API_-_Production__1_.yaml 기반
 * 
 * 주요 기능:
 * 1. 설정 관리 (Prompt, Document, Background, Model Style, AI Models)
 * 2. 채팅 세션 생성 및 관리
 * 3. 메시지 교환 (Text, Audio)
 * 4. 실시간 통신 지원
 */
@Service
@Slf4j
public class PersoAIServiceImpl implements PersoAIService {

    @Value("${persoai.api.server}")
    private String apiServer;

    @Value("${persoai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PersoAIServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * HTTP 요청 헤더 생성
     * PersoLive-APIKey 인증 사용
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("PersoLive-APIKey", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    /**
     * 모든 Prompt 조회
     * GET /api/v1/prompt/
     */
    @Override
    public List<PromptDto> getAllPrompts() {
        try {
            String url = apiServer + "/api/v1/prompt/";
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("Prompt 목록 조회 요청: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            List<PromptDto> prompts = new ArrayList<>();
            
            if (root.isArray()) {
                for (JsonNode node : root) {
                    try {
                        PromptDto dto = new PromptDto();
                        
                        // prompt_id 또는 id 필드 확인
                        JsonNode idNode = node.has("prompt_id") ? node.get("prompt_id") : node.get("id");
                        if (idNode != null && !idNode.isNull()) {
                            dto.setPromptId(idNode.asText());
                        } else {
                            log.warn("Prompt에 ID 필드가 없습니다: {}", node);
                            continue;
                        }
                        
                        if (node.has("name") && !node.get("name").isNull()) {
                            dto.setName(node.get("name").asText());
                        }
                        
                        if (node.has("prompt") && !node.get("prompt").isNull()) {
                            dto.setPrompt(node.get("prompt").asText());
                        }
                        
                        if (node.has("intro_message") && !node.get("intro_message").isNull()) {
                            dto.setIntroMessage(node.get("intro_message").asText());
                        }
                        
                        if (node.has("created_at") && !node.get("created_at").isNull()) {
                            dto.setCreatedAt(LocalDateTime.parse(
                                node.get("created_at").asText(),
                                DateTimeFormatter.ISO_DATE_TIME
                            ));
                        }
                        
                        prompts.add(dto);
                    } catch (Exception e) {
                        log.warn("Prompt 파싱 실패, 건너뜀: {}", e.getMessage());
                    }
                }
            }
            
            log.info("✅ 프롬프트 {} 개 로드 완료", prompts.size());
            return prompts;
            
        } catch (Exception e) {
            log.error("❌ 프롬프트 로드 실패", e);
            throw new RuntimeException("프롬프트 로드 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 모든 Document 조회
     * GET /api/v1/document/
     */
    @Override
    public List<DocumentDto> getAllDocuments() {
        try {
            String url = apiServer + "/api/v1/document/";
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("Document 목록 조회 요청: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            List<DocumentDto> documents = new ArrayList<>();
            
            if (root.isArray()) {
                for (JsonNode node : root) {
                    try {
                        DocumentDto dto = new DocumentDto();
                        
                        // document_id 또는 id 필드 확인
                        JsonNode idNode = node.has("document_id") ? node.get("document_id") : node.get("id");
                        if (idNode != null && !idNode.isNull()) {
                            dto.setDocumentId(idNode.asText());
                        } else {
                            log.warn("Document에 ID 필드가 없습니다: {}", node);
                            continue;
                        }
                        
                        if (node.has("name") && !node.get("name").isNull()) {
                            dto.setName(node.get("name").asText());
                        }
                        
                        if (node.has("file") && !node.get("file").isNull()) {
                            dto.setFileUrl(node.get("file").asText());
                        }
                        
                        if (node.has("created_at") && !node.get("created_at").isNull()) {
                            dto.setCreatedAt(LocalDateTime.parse(
                                node.get("created_at").asText(),
                                DateTimeFormatter.ISO_DATE_TIME
                            ));
                        }
                        
                        documents.add(dto);
                    } catch (Exception e) {
                        log.warn("Document 파싱 실패, 건너뜀: {}", e.getMessage());
                    }
                }
            }
            
            log.info("✅ 문서 {} 개 로드 완료", documents.size());
            return documents;
            
        } catch (Exception e) {
            log.error("❌ 문서 로드 실패", e);
            throw new RuntimeException("문서 로드 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 모든 Background Image 조회
     * GET /api/v1/background_image/
     */
    @Override
    public List<BackgroundImageDto> getAllBackgroundImages() {
        try {
            String url = apiServer + "/api/v1/background_image/";
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("Background Image 목록 조회 요청: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            List<BackgroundImageDto> images = new ArrayList<>();
            
            if (root.isArray()) {
                for (JsonNode node : root) {
                    try {
                        BackgroundImageDto dto = new BackgroundImageDto();
                        
                        // backgroundimage_id 또는 background_image_id 또는 id 필드 확인
                        JsonNode idNode = node.has("backgroundimage_id") ? node.get("backgroundimage_id") : 
                                         node.has("background_image_id") ? node.get("background_image_id") :
                                         node.get("id");
                        if (idNode != null && !idNode.isNull()) {
                            dto.setBackgroundImageId(idNode.asText());
                        } else {
                            log.warn("BackgroundImage에 ID 필드가 없습니다: {}", node);
                            continue;
                        }
                        
                        if (node.has("name") && !node.get("name").isNull()) {
                            dto.setName(node.get("name").asText());
                        }
                        
                        if (node.has("image") && !node.get("image").isNull()) {
                            dto.setImageUrl(node.get("image").asText());
                        }
                        
                        if (node.has("created_at") && !node.get("created_at").isNull()) {
                            dto.setCreatedAt(LocalDateTime.parse(
                                node.get("created_at").asText(),
                                DateTimeFormatter.ISO_DATE_TIME
                            ));
                        }
                        
                        images.add(dto);
                    } catch (Exception e) {
                        log.warn("BackgroundImage 파싱 실패, 건너뜀: {}", e.getMessage());
                    }
                }
            }
            
            log.info("✅ 배경 이미지 {} 개 로드 완료", images.size());
            return images;
            
        } catch (Exception e) {
            log.error("❌ 배경 이미지 로드 실패", e);
            throw new RuntimeException("배경 이미지 로드 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 모든 Model Style 조회 (Settings API 우선 사용, 실패 시 core API)
     * GET /api/v1/settings/modelstyle/ (우선)
     * GET /api/core/v1/model_style/ (대체)
     */
    @Override
    public List<ModelStyleDto> getAllModelStyles() {
        // 1. Settings API 시도
        try {
            String url = apiServer + "/api/v1/settings/modelstyle/";
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("Model Style 목록 조회 요청 (Settings API): {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            List<ModelStyleDto> styles = new ArrayList<>();
            
            // 응답 형식: 문자열 배열 또는 객체 배열
            if (root.isArray()) {
                for (JsonNode node : root) {
                    try {
                        ModelStyleDto dto = new ModelStyleDto();
                        
                        // 문자열이면 직접 사용
                        if (node.isTextual()) {
                            dto.setName(node.asText());
                            dto.setModelName("default");
                            dto.setStyles(new ArrayList<>());
                        }
                        // 객체면 필드 추출
                        else if (node.isObject()) {
                            if (node.has("name") && !node.get("name").isNull()) {
                                dto.setName(node.get("name").asText());
                            }
                            if (node.has("model") && !node.get("model").isNull()) {
                                dto.setModelName(node.get("model").asText());
                            }
                            dto.setStyles(new ArrayList<>());
                        } else {
                            continue;
                        }
                        
                        styles.add(dto);
                    } catch (Exception e) {
                        log.warn("Model Style 파싱 실패, 건너뜀: {}", e.getMessage());
                    }
                }
            }
            
            if (!styles.isEmpty()) {
                log.info("✅ 모델 스타일 {} 개 로드 완료 (Settings API)", styles.size());
                return styles;
            }
            
        } catch (Exception e) {
            log.warn("⚠️ Settings API 실패, Core API 시도: {}", e.getMessage());
        }
        
        // 2. Core API 시도 (중첩 구조)
        try {
            String url = apiServer + "/api/core/v1/model_style/";
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("Model Style 목록 조회 요청 (Core API): {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            List<ModelStyleDto> allStyles = new ArrayList<>();
            
            if (root.isArray()) {
                for (JsonNode categoryNode : root) {
                    try {
                        // 각 카테고리의 styles 배열 처리
                        if (categoryNode.has("styles") && categoryNode.get("styles").isArray()) {
                            JsonNode stylesArray = categoryNode.get("styles");
                            
                            for (JsonNode styleNode : stylesArray) {
                                ModelStyleDto dto = new ModelStyleDto();
                                
                                if (styleNode.has("name") && !styleNode.get("name").isNull()) {
                                    dto.setName(styleNode.get("name").asText());
                                }
                                
                                if (styleNode.has("model") && !styleNode.get("model").isNull()) {
                                    dto.setModelName(styleNode.get("model").asText());
                                }
                                
                                List<String> styleList = new ArrayList<>();
                                if (styleNode.has("style") && !styleNode.get("style").isNull()) {
                                    styleList.add(styleNode.get("style").asText());
                                }
                                dto.setStyles(styleList);
                                
                                allStyles.add(dto);
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Model Style 카테고리 파싱 실패, 건너뜀: {}", e.getMessage());
                    }
                }
            }
            
            if (!allStyles.isEmpty()) {
                log.info("✅ 모델 스타일 {} 개 로드 완료 (Core API)", allStyles.size());
                return allStyles;
            }
            
        } catch (Exception e) {
            log.warn("⚠️ Core API도 실패, 기본값 사용: {}", e.getMessage());
        }
        
        // 3. 기본값 사용
        log.info("⚠️ API에서 Model Style을 가져올 수 없어 기본값 사용");
        return getDefaultModelStyles();
    }
    
    /**
     * 기본 Model Style 제공
     */
    private List<ModelStyleDto> getDefaultModelStyles() {
        List<ModelStyleDto> defaults = new ArrayList<>();
        
        ModelStyleDto realistic = new ModelStyleDto();
        realistic.setName("realistic");
        realistic.setModelName("default");
        realistic.setStyles(Arrays.asList("professional", "casual"));
        defaults.add(realistic);
        
        ModelStyleDto cartoon = new ModelStyleDto();
        cartoon.setName("cartoon");
        cartoon.setModelName("default");
        cartoon.setStyles(Arrays.asList("friendly"));
        defaults.add(cartoon);
        
        log.info("✅ 기본 모델 스타일 {} 개 제공", defaults.size());
        return defaults;
    }

    /**
     * 모든 AI 모델 조회 (Settings API 사용)
     * GET /api/v1/settings/llm_type/
     * GET /api/v1/settings/tts_type/
     * GET /api/v1/settings/stt_type/
     */
    @Override
    public List<AIModelDto> getAllModels() {
        List<AIModelDto> allModels = new ArrayList<>();
        
        try {
            // LLM 타입 조회
            List<AIModelDto> llmModels = fetchModelTypes("/api/v1/settings/llm_type/", "llm");
            allModels.addAll(llmModels);
            
            // TTS 타입 조회
            List<AIModelDto> ttsModels = fetchModelTypes("/api/v1/settings/tts_type/", "tts");
            allModels.addAll(ttsModels);
            
            // STT 타입 조회
            List<AIModelDto> sttModels = fetchModelTypes("/api/v1/settings/stt_type/", "stt");
            allModels.addAll(sttModels);
            
            log.info("✅ AI 모델 {} 개 로드 완료 (LLM: {}, TTS: {}, STT: {})", 
                allModels.size(), llmModels.size(), ttsModels.size(), sttModels.size());
            
            // API 응답이 비어있으면 기본값 사용
            if (allModels.isEmpty()) {
                log.info("⚠️ API에서 AI Models를 가져올 수 없어 기본값 사용");
                return getDefaultModels();
            }
            
            return allModels;
            
        } catch (Exception e) {
            log.warn("⚠️ AI 모델 API 호출 실패 ({}), 기본값 사용", e.getMessage());
            return getDefaultModels();
        }
    }
    
    /**
     * Settings API에서 모델 타입 목록 조회
     */
    private List<AIModelDto> fetchModelTypes(String endpoint, String type) {
        List<AIModelDto> models = new ArrayList<>();
        
        try {
            String url = apiServer + endpoint;
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("{} 모델 타입 조회 요청: {}", type.toUpperCase(), url);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            
            // 응답 형식: 문자열 배열 ["gpt-4", "gpt-3.5-turbo"] 또는 객체 배열
            if (root.isArray()) {
                for (JsonNode node : root) {
                    try {
                        AIModelDto dto = new AIModelDto();
                        
                        // 문자열이면 직접 사용
                        if (node.isTextual()) {
                            dto.setName(node.asText());
                            dto.setType(type);
                        }
                        // 객체면 name 필드 추출
                        else if (node.isObject() && node.has("name")) {
                            dto.setName(node.get("name").asText());
                            dto.setType(type);
                        } else {
                            continue;
                        }
                        
                        models.add(dto);
                    } catch (Exception e) {
                        log.warn("{} 모델 파싱 실패, 건너뜀: {}", type, e.getMessage());
                    }
                }
            }
            
            log.info("✅ {} 모델 {} 개 로드 완료", type.toUpperCase(), models.size());
            
        } catch (Exception e) {
            log.warn("⚠️ {} 모델 조회 실패: {}", type, e.getMessage());
        }
        
        return models;
    }
    
    /**
     * 기본 AI 모델 제공
     */
    private List<AIModelDto> getDefaultModels() {
        List<AIModelDto> defaults = new ArrayList<>();
        
        // LLM 모델들
        AIModelDto gpt4 = new AIModelDto();
        gpt4.setName("gpt-4");
        gpt4.setType("llm");
        defaults.add(gpt4);
        
        AIModelDto gpt35 = new AIModelDto();
        gpt35.setName("gpt-3.5-turbo");
        gpt35.setType("llm");
        defaults.add(gpt35);
        
        AIModelDto claude = new AIModelDto();
        claude.setName("claude-3-opus");
        claude.setType("llm");
        defaults.add(claude);
        
        // TTS 모델들
        AIModelDto openaiTTS = new AIModelDto();
        openaiTTS.setName("openai-ash");
        openaiTTS.setType("tts");
        defaults.add(openaiTTS);
        
        AIModelDto openaiTTS2 = new AIModelDto();
        openaiTTS2.setName("openai-nova");
        openaiTTS2.setType("tts");
        defaults.add(openaiTTS2);
        
        // STT 모델
        AIModelDto whisper = new AIModelDto();
        whisper.setName("whisper-1");
        whisper.setType("stt");
        defaults.add(whisper);
        
        log.info("✅ 기본 AI 모델 {} 개 제공 (LLM: 3, TTS: 2, STT: 1)", defaults.size());
        return defaults;
    }

    /**
     * 전체 설정 번들 로드 (캐시 사용)
     * 
     * 모든 설정을 한 번에 로드하여 프론트엔드에서 사용
     * 3600초(1시간) 캐싱
     */
    @Override
    @Cacheable(value = "configurations", unless = "#result == null")
    public ConfigurationBundle loadAllConfigurations() {
        log.info("🔄 전체 설정 로드 시작");
        
        try {
            ConfigurationBundle bundle = new ConfigurationBundle();
            
            // 각 설정 로드
            bundle.setPrompts(getAllPrompts());
            bundle.setDocuments(getAllDocuments());
            bundle.setBackgroundImages(getAllBackgroundImages());
            bundle.setModelStyles(getAllModelStyles());
            
            // AI 모델 타입별 분류
            List<AIModelDto> allModels = getAllModels();
            bundle.setLlmModels(allModels.stream()
                .filter(m -> "llm".equalsIgnoreCase(m.getType()))
                .collect(Collectors.toList()));
            bundle.setTtsModels(allModels.stream()
                .filter(m -> "tts".equalsIgnoreCase(m.getType()))
                .collect(Collectors.toList()));
            bundle.setSttModels(allModels.stream()
                .filter(m -> "stt".equalsIgnoreCase(m.getType()))
                .collect(Collectors.toList()));
            
            log.info("✅ 전체 설정 로드 완료 - Prompts: {}, Documents: {}, Backgrounds: {}, Styles: {}, LLM: {}, TTS: {}, STT: {}",
                bundle.getPrompts().size(),
                bundle.getDocuments().size(),
                bundle.getBackgroundImages().size(),
                bundle.getModelStyles().size(),
                bundle.getLlmModels().size(),
                bundle.getTtsModels().size(),
                bundle.getSttModels().size()
            );
            
            return bundle;
            
        } catch (Exception e) {
            log.error("❌ 전체 설정 로드 실패", e);
            throw new RuntimeException("전체 설정 로드 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 채팅 세션 생성
     * POST /api/live_chat/v2/session/
     * 
     * @param request 세션 생성 요청 정보
     * @return 생성된 세션 정보
     */
    @Override
    public SessionDto createSession(SessionCreateRequest request) {
        try {
            String url = apiServer + "/api/live_chat/v2/session/";
            
            // 요청 본문 구성
            Map<String, Object> body = new HashMap<>();
            body.put("prompt", request.getPromptId());
            body.put("document", request.getDocumentId());
            body.put("llm_type", request.getLlmType());
            body.put("tts_type", request.getTtsType());
            body.put("stt_type", request.getSttType());
            body.put("model_style", request.getModelStyle());
            body.put("background_image", request.getBackgroundImageId());
            body.put("padding_left", request.getPaddingLeft() != null ? request.getPaddingLeft() : 0.0);
            body.put("padding_top", request.getPaddingTop() != null ? request.getPaddingTop() : 0.0);
            body.put("padding_height", request.getPaddingHeight() != null ? request.getPaddingHeight() : 1.0);
            
            // capability 설정 (기본값: ["text", "audio"])
            List<String> capability = request.getCapability() != null && !request.getCapability().isEmpty()
                ? request.getCapability()
                : Arrays.asList("text", "audio");
            body.put("capability", capability);
            
            // extra_data 설정
            if (request.getExtraData() != null) {
                body.put("extra_data", request.getExtraData());
            }
            
            HttpEntity<Map<String, Object>> httpRequest = 
                new HttpEntity<>(body, createHeaders());
            
            log.info("채팅 세션 생성 요청: {}", url);
            log.debug("요청 본문: {}", body);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, httpRequest, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            
            SessionDto session = new SessionDto();
            session.setSessionId(root.get("session_id").asText());
            session.setCreatedAt(LocalDateTime.now());
            session.setStatus("ACTIVE");
            
            log.info("✅ 세션 생성 완료: {}", session.getSessionId());
            return session;
            
        } catch (Exception e) {
            log.error("❌ 세션 생성 실패", e);
            throw new RuntimeException("세션 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 세션 정보 조회
     * GET /api/live_chat/v2/session/{session_id}/
     */
    @Override
    public SessionDto getSession(String sessionId) {
        try {
            String url = apiServer + "/api/live_chat/v2/session/" + sessionId + "/";
            HttpEntity<Void> request = new HttpEntity<>(createHeaders());
            
            log.info("세션 정보 조회: {}", sessionId);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            
            SessionDto session = new SessionDto();
            session.setSessionId(root.get("session_id").asText());
            session.setStatus(root.has("status") ? root.get("status").asText() : "ACTIVE");
            session.setCreatedAt(LocalDateTime.now());
            
            log.info("✅ 세션 정보 조회 완료: {}", sessionId);
            return session;
            
        } catch (Exception e) {
            log.error("❌ 세션 정보 조회 실패: {}", sessionId, e);
            throw new RuntimeException("세션 정보 조회 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 세션 종료
     * 세션에 종료 이벤트 전송
     */
    @Override
    public void terminateSession(String sessionId) {
        try {
            String url = apiServer + "/api/live_chat/v2/session/" + sessionId + "/event_create/";
            
            Map<String, Object> body = new HashMap<>();
            body.put("event", "SESSION_END");
            body.put("detail", "User terminated session");
            
            HttpEntity<Map<String, Object>> request = 
                new HttpEntity<>(body, createHeaders());
            
            log.info("세션 종료 요청: {}", sessionId);
            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            
            log.info("✅ 세션 종료 완료: {}", sessionId);
            
        } catch (Exception e) {
            log.error("❌ 세션 종료 실패: {}", sessionId, e);
            throw new RuntimeException("세션 종료 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 메시지 전송
     * POST /api/live_chat/v2/session/{session_id}/exchange/
     */
    @Override
    public ExchangeResponse sendMessage(String sessionId, String message) {
        try {
            String url = apiServer + "/api/live_chat/v2/session/" + sessionId + "/exchange/";
            
            Map<String, Object> body = new HashMap<>();
            body.put("message", message);
            
            HttpEntity<Map<String, Object>> request = 
                new HttpEntity<>(body, createHeaders());
            
            log.info("메시지 전송: sessionId={}, message={}", sessionId, message);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, request, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            
            ExchangeResponse exchangeResponse = new ExchangeResponse();
            exchangeResponse.setResponse(root.get("response").asText());
            exchangeResponse.setSessionId(sessionId);
            exchangeResponse.setTimestamp(LocalDateTime.now());
            
            log.info("✅ 메시지 전송 완료");
            return exchangeResponse;
            
        } catch (Exception e) {
            log.error("❌ 메시지 전송 실패: sessionId={}", sessionId, e);
            throw new RuntimeException("메시지 전송 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public TTSResponse textToSpeech(String sessionId, String text) {
        // TODO: TTS API 구현
        throw new UnsupportedOperationException("TTS 기능은 아직 구현되지 않았습니다.");
    }

    @Override
    public STTResponse speechToText(String sessionId, org.springframework.web.multipart.MultipartFile audioFile) {
        // TODO: STT API 구현
        throw new UnsupportedOperationException("STT 기능은 아직 구현되지 않았습니다.");
    }
}