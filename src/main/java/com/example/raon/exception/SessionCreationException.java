package com.example.raon.exception;

/**
 * PersoAI 세션 생성 실패 시 발생하는 예외
 */
public class SessionCreationException extends RuntimeException {
    public SessionCreationException(String message) {
        super(message);
    }

    public SessionCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
