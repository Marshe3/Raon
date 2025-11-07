package com.example.raon.exception;

public class ChatbotNotFoundException extends RuntimeException {
    public ChatbotNotFoundException(Long chatbotId) {
        super("Chatbot not found with id: " + chatbotId);
    }

    public ChatbotNotFoundException(String message) {
        super(message);
    }
}
