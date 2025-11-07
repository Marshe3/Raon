package com.example.raon.service;

import com.example.raon.domain.*;
import com.example.raon.dto.chat.*;
import com.example.raon.exception.*;
import com.example.raon.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PersoAIChatService {

    private final PersoAIProperties properties;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private final UserRepository userRepository;
    private final ChatbotRepository chatbotRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    
    /**
     * 새 채팅 세션 생성 (User + Chatbot 기반)
     */
    @Transactional
    public Mono<CreateSessionResponse> createSession(Long userId, Long chatbotId, CreateSessionRequest request) {
        log.info("Creating new PersoAI chat session for user: {}, chatbot: {}", userId, chatbotId);
        
        // User와 Chatbot 조회
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        Chatbot chatbot = chatbotRepository.findById(chatbotId)
                .orElseThrow(() -> new ChatbotNotFoundException(chatbotId));
        
        WebClient webClient = webClientBuilder
                .baseUrl(properties.getApi().getServer())
                .build();
        
        // Chatbot 설정을 기본값으로 사용
        Map<String, Object> requestBody = new HashMap<>();

        // llm_type은 선택적 - 값이 있을 때만 추가 (API가 기본값 사용하도록)
        String llmType = chatbot.getLlmType() != null ?
                chatbot.getLlmType() : properties.getDefaults().getLlmType();
        if (llmType != null && !llmType.isEmpty()) {
            requestBody.put("llm_type", llmType);
        }

        requestBody.put("tts_type", chatbot.getTtsType() != null ?
                chatbot.getTtsType() : properties.getDefaults().getTtsType());
        requestBody.put("stt_type", chatbot.getSttType() != null ?
                chatbot.getSttType() : properties.getDefaults().getSttType());

        // model_style은 null이 아닐 때만 추가 (잘못된 값으로 인한 에러 방지)
        String modelStyle = chatbot.getModelStyle() != null ?
                chatbot.getModelStyle() : properties.getDefaults().getModelStyle();
        if (modelStyle != null && !modelStyle.isEmpty()) {
            requestBody.put("model_style", modelStyle);
        }

        requestBody.put("prompt", chatbot.getPromptId() != null ?
                chatbot.getPromptId() : properties.getDefaults().getPrompt());
        
        // Document ID 추가 (중요!)
        if (chatbot.getDocumentId() != null) {
            requestBody.put("document", chatbot.getDocumentId());
        } else if (request.getDocument() != null) {
            requestBody.put("document", request.getDocument());
        }
        
        if (request.getCapability() != null && !request.getCapability().isEmpty()) {
            requestBody.put("capability", request.getCapability());
        } else {
            requestBody.put("capability", Arrays.asList("LLM", "TTS", "STT"));
        }
        
        return webClient.post()
                .uri("/api/v1/session/")
                .header("PersoLive-APIKey", properties.getApi().getKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.value() != 201,
                    response -> response.bodyToMono(String.class)
                        .map(body -> new PersoAISessionException("Session creation failed: " + body)))
                .bodyToMono(Map.class)
                .map(response -> {
                    String persoaiSessionId = (String) response.get("session_id");
                    
                    // ChatRoom 생성
                    ChatRoom chatRoom = ChatRoom.builder()
                            .user(user)
                            .chatbot(chatbot)
                            .chatTitle("새로운 대화")  // 첫 메시지로 나중에 업데이트 가능
                            .persoaiSessionId(persoaiSessionId)
                            .sessionStatus("CREATED")
                            .build();
                    
                    chatRoomRepository.save(chatRoom);
                    
                    return CreateSessionResponse.builder()
                            .sessionId(persoaiSessionId)
                            .createdAt(LocalDateTime.now())
                            .status((String) response.get("status"))
                            .llmType((String) response.get("llm_type"))
                            .ttsType((String) response.get("tts_type"))
                            .modelStyle((String) response.get("model_style"))
                            .build();
                })
                .doOnSuccess(response -> log.info("Session created successfully: {}", response.getSessionId()))
                .doOnError(error -> log.error("Failed to create session", error));
    }
    
    /**
     * 세션 시작
     */
    @Transactional
    public Mono<Void> startSession(String persoaiSessionId) {
        log.info("Starting session: {}", persoaiSessionId);
        
        WebClient webClient = webClientBuilder
                .baseUrl(properties.getApi().getServer())
                .build();
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("event", "SESSION_START");
        requestBody.put("detail", "Session started via Spring Boot");

        return webClient.post()
                .uri("/api/v1/session/{sessionId}/event/create/", persoaiSessionId)
                .header("PersoLive-APIKey", properties.getApi().getKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.value() != 201,
                    response -> response.bodyToMono(String.class)
                        .map(body -> new PersoAISessionException("Session start failed: " + body)))
                .bodyToMono(Void.class)
                .doOnSuccess(v -> {
                    log.info("Session started successfully: {}", persoaiSessionId);
                    // ChatRoom 상태 업데이트
                    chatRoomRepository.findByPersoaiSessionId(persoaiSessionId)
                            .ifPresent(chatRoom -> {
                                chatRoom.startSession(persoaiSessionId);
                                chatRoomRepository.save(chatRoom);
                            });
                })
                .doOnError(error -> log.error("Failed to start session: {}", persoaiSessionId, error));
    }
    
    /**
     * 텍스트 메시지로 채팅 (스트리밍, v2 API)
     */
    @Transactional
    public Flux<String> chatText(String persoaiSessionId, String message) {
        log.info("Sending chat message to session (v2): {}", persoaiSessionId);

        // ChatRoom 조회 및 사용자 메시지 저장
        ChatRoom chatRoom = chatRoomRepository.findByPersoaiSessionId(persoaiSessionId)
                .orElseThrow(() -> new ChatRoomNotFoundException(persoaiSessionId));

        Message userMessage = Message.createUserMessage(message);
        chatRoom.addMessage(userMessage);
        messageRepository.save(userMessage);

        // 첫 메시지라면 채팅방 제목 생성
        if (chatRoom.getMessages().size() == 1) {
            String title = message.length() > 30 ? message.substring(0, 30) + "..." : message;
            chatRoom.updateTitle(title);
        }

        // v2 API를 위해 전체 메시지 기록 조회
        List<Message> allMessages = chatRoom.getMessages();
        List<Map<String, String>> messageHistory = allMessages.stream()
                .map(msg -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("role", msg.getRole());
                    map.put("content", msg.getContent());
                    return map;
                })
                .collect(Collectors.toList());

        WebClient webClient = webClientBuilder
                .baseUrl(properties.getApi().getServer())
                .build();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messages", messageHistory);
        // v2에서는 tools 파라미터도 추가할 수 있으나, 우선은 기본 채팅만 구현
        // requestBody.put("tools", new ArrayList<>());

        StringBuilder fullResponse = new StringBuilder();

        return webClient.post()
                .uri("/api/v1/session/{sessionId}/llm/v2/", persoaiSessionId) // v2 엔드포인트 사용
                .header("PersoLive-APIKey", properties.getApi().getKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .map(line -> {
                    log.debug("Raw API response line: {}", line);
                    if (line.startsWith("data: ")) {
                        try {
                            String jsonStr = line.substring(6).trim();
                            log.debug("Parsed JSON: {}", jsonStr);

                            // Skip [DONE] signal
                            if ("[DONE]".equals(jsonStr)) {
                                return "";
                            }

                            // Parse JSON using ObjectMapper
                            JsonNode jsonNode = objectMapper.readTree(jsonStr);

                            // Try different field names that might contain the response text
                            String sentence = null;
                            if (jsonNode.has("sentence")) {
                                sentence = jsonNode.get("sentence").asText();
                            } else if (jsonNode.has("content")) {
                                sentence = jsonNode.get("content").asText();
                            } else if (jsonNode.has("text")) {
                                sentence = jsonNode.get("text").asText();
                            } else if (jsonNode.has("delta")) {
                                JsonNode delta = jsonNode.get("delta");
                                if (delta.has("content")) {
                                    sentence = delta.get("content").asText();
                                }
                            } else if (jsonNode.has("choices")) {
                                JsonNode choices = jsonNode.get("choices");
                                if (choices.isArray() && choices.size() > 0) {
                                    JsonNode firstChoice = choices.get(0);
                                    if (firstChoice.has("delta") && firstChoice.get("delta").has("content")) {
                                        sentence = firstChoice.get("delta").get("content").asText();
                                    }
                                }
                            }

                            if (sentence != null && !sentence.isEmpty()) {
                                fullResponse.append(sentence);
                                log.debug("Extracted sentence: {}", sentence);
                                return sentence;
                            } else {
                                log.warn("No text content found in JSON: {}", jsonStr);
                            }
                        } catch (Exception e) {
                            log.warn("Failed to parse streaming response line: {}", line, e);
                        }
                    } else if (!line.trim().isEmpty()) {
                        log.debug("Line does not start with 'data: ': {}", line);
                    }
                    return "";
                })
                .filter(s -> !s.isEmpty())
                .doOnComplete(() -> {
                    // AI 응답을 DB에 저장
                    if (fullResponse.length() > 0) {
                        Message assistantMessage = Message.createAssistantMessage(fullResponse.toString());
                        chatRoom.addMessage(assistantMessage);
                        messageRepository.save(assistantMessage);
                        chatRoomRepository.save(chatRoom); // lastMessageAt 업데이트
                        log.info("Saved assistant response for session {}", persoaiSessionId);
                    }
                })
                .doOnError(error -> log.error("Error during chat with session {}: {}", persoaiSessionId, error.getMessage()));
    }
    
    /**
     * 세션 종료
     */
    @Transactional
    public Mono<Void> endSession(String persoaiSessionId) {
        log.info("Ending session: {}", persoaiSessionId);
        
        WebClient webClient = webClientBuilder
                .baseUrl(properties.getApi().getServer())
                .build();
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("event", "SESSION_END");
        requestBody.put("detail", "Session ended via Spring Boot");

        return webClient.post()
                .uri("/api/v1/session/{sessionId}/event/create/", persoaiSessionId)
                .header("PersoLive-APIKey", properties.getApi().getKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.value() != 201,
                    response -> response.bodyToMono(String.class)
                        .map(body -> new PersoAISessionException("Session end failed: " + body)))
                .bodyToMono(Void.class)
                .doOnSuccess(v -> {
                    log.info("Session ended successfully: {}", persoaiSessionId);
                    // ChatRoom 상태 업데이트
                    chatRoomRepository.findByPersoaiSessionId(persoaiSessionId)
                            .ifPresent(chatRoom -> {
                                chatRoom.endSession();
                                chatRoomRepository.save(chatRoom);
                            });
                })
                .doOnError(error -> log.error("Failed to end session: {}", persoaiSessionId, error));
    }
    
    /**
     * 채팅 히스토리 조회 (ChatRoom ID로)
     */
    @Transactional(readOnly = true)
    public List<ChatHistoryItem> getChatHistory(Long chatId) {
        List<Message> messages = messageRepository.findByChatRoom_ChatIdOrderByCreatedAtAsc(chatId);
        
        return messages.stream()
                .map(msg -> ChatHistoryItem.builder()
                        .role(msg.getRole())
                        .content(msg.getContent())
                        .timestamp(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자의 채팅방 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatRoom> getUserChatRooms(Long userId) {
        return chatRoomRepository.findByUser_UserIdOrderByLastMessageAtDesc(userId);
    }
    
    /**
     * 공개 챗봇 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Chatbot> getPublicChatbots() {
        return chatbotRepository.findPublicChatbots();
    }
    
    // 기존 TTS, STT, getSessionStatus, getAvailableSettings 메서드들은 동일...
}