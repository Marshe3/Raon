package com.example.raon.exception;

/**
 * 잘못된 JWT 토큰일 때 발생하는 예외
 */
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
