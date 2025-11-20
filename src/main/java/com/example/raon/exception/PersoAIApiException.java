package com.example.raon.exception;

/**
 * PersoAI API 호출 중 발생하는 예외
 */
public class PersoAIApiException extends RuntimeException {
    private final int statusCode;

    public PersoAIApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public PersoAIApiException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
