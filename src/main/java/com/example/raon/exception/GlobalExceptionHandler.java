package com.example.raon.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * 전역 예외 핸들러
 * 모든 컨트롤러에서 발생하는 예외를 JSON 형식으로 반환
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 일반 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("❌ Unhandled exception: {}", e.getMessage(), e);

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Internal Server Error");
        error.put("message", e.getMessage());
        error.put("status", 500);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * 404 Not Found 예외 처리
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoHandlerFoundException(NoHandlerFoundException e) {
        log.warn("⚠️ No handler found: {}", e.getRequestURL());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Not Found");
        error.put("message", "The requested endpoint does not exist");
        error.put("path", e.getRequestURL());
        error.put("status", 404);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * IllegalArgumentException 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("⚠️ Invalid argument: {}", e.getMessage());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Bad Request");
        error.put("message", e.getMessage());
        error.put("status", 400);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * UserNotFoundException 처리
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException e) {
        log.warn("⚠️ User not found: {}", e.getMessage());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "User Not Found");
        error.put("message", e.getMessage());
        error.put("status", 404);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * ChatRoomNotFoundException 처리
     */
    @ExceptionHandler(ChatRoomNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleChatRoomNotFoundException(ChatRoomNotFoundException e) {
        log.warn("⚠️ ChatRoom not found: {}", e.getMessage());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "ChatRoom Not Found");
        error.put("message", e.getMessage());
        error.put("status", 404);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * ChatbotNotFoundException 처리
     */
    @ExceptionHandler(ChatbotNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleChatbotNotFoundException(ChatbotNotFoundException e) {
        log.warn("⚠️ Chatbot not found: {}", e.getMessage());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Chatbot Not Found");
        error.put("message", e.getMessage());
        error.put("status", 404);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * SessionCreationException 처리
     */
    @ExceptionHandler(SessionCreationException.class)
    public ResponseEntity<Map<String, Object>> handleSessionCreationException(SessionCreationException e) {
        log.error("❌ Session creation failed: {}", e.getMessage(), e);

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Session Creation Failed");
        error.put("message", e.getMessage());
        error.put("status", 500);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * PersoAIApiException 처리
     */
    @ExceptionHandler(PersoAIApiException.class)
    public ResponseEntity<Map<String, Object>> handlePersoAIApiException(PersoAIApiException e) {
        log.error("❌ PersoAI API error ({}): {}", e.getStatusCode(), e.getMessage(), e);

        Map<String, Object> error = new HashMap<>();
        error.put("error", "PersoAI API Error");
        error.put("message", e.getMessage());
        error.put("status", e.getStatusCode());

        return ResponseEntity.status(e.getStatusCode()).body(error);
    }

    /**
     * InvalidTokenException 처리
     */
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTokenException(InvalidTokenException e) {
        log.warn("⚠️ Invalid token: {}", e.getMessage());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Invalid Token");
        error.put("message", e.getMessage());
        error.put("status", 401);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * TokenExpiredException 처리
     */
    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleTokenExpiredException(TokenExpiredException e) {
        log.warn("⚠️ Token expired: {}", e.getMessage());

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Token Expired");
        error.put("message", e.getMessage());
        error.put("status", 401);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * RuntimeException 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        log.error("❌ Runtime exception: {}", e.getMessage(), e);

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Runtime Error");
        error.put("message", e.getMessage());
        error.put("status", 500);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
