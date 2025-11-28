package com.example.raon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 면접 피드백 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackRequest {

    /**
     * 면접 대화 내역 (전체 메시지)
     */
    private List<MessageDto> messages;

    /**
     * 채팅방 ID (선택)
     */
    private Long chatId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDto {
        private String role;    // "user" 또는 "assistant"
        private String content; // 메시지 내용
    }
}
