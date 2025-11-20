package com.example.raon.exception;

/**
 * JWT 토큰이 만료되었을 때 발생하는 예외
 */
public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
