package com.example.raon.exception;

/**
 * 채팅방을 찾을 수 없을 때 발생하는 예외
 */
public class ChatRoomNotFoundException extends RuntimeException {
    public ChatRoomNotFoundException(Long chatRoomId) {
        super("ChatRoom not found with id: " + chatRoomId);
    }

    public ChatRoomNotFoundException(String message) {
        super(message);
    }
}
