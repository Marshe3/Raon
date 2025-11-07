package com.example.raon.exception;

public class PersoAISessionException extends RuntimeException {
    public PersoAISessionException(String message) {
        super(message);
    }

    public PersoAISessionException(String message, Throwable cause) {
        super(message, cause);
    }
}
