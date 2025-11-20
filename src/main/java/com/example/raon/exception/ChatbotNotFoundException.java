package com.example.raon.exception;

/**
 * 챗봇을 찾을 수 없을 때 발생하는 예외
 */
public class ChatbotNotFoundException extends RuntimeException {
    public ChatbotNotFoundException(Long chatbotId) {
        super("Chatbot not found with id: " + chatbotId);
    }

    public ChatbotNotFoundException(String message) {
        super(message);
    }
}
