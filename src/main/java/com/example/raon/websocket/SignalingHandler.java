package com.example.raon.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 단순히 받은 메시지를 그대로 돌려보냄 (에코 기능)
        String payload = message.getPayload();
        System.out.println("받은 메시지: " + payload);

        session.sendMessage(new TextMessage("서버로부터 응답: " + payload));
    }
}