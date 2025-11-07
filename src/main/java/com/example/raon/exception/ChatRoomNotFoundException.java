package com.example.raon.exception;

public class ChatRoomNotFoundException extends RuntimeException {
    public ChatRoomNotFoundException(String sessionId) {
        super("ChatRoom not found for session: " + sessionId);
    }

    public ChatRoomNotFoundException(Long chatRoomId) {
        super("ChatRoom not found with id: " + chatRoomId);
    }

    public ChatRoomNotFoundException(String message, Object... args) {
        super(String.format(message, args));
    }
}
