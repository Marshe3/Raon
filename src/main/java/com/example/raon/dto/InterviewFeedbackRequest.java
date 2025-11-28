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

    /**
     * 면접 종류 (예: "백엔드 개발자", "게임 개발자")
     */
    private String interviewType;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDto {
        private String role;    // "user" 또는 "assistant"
        private String content; // 메시지 내용
    }
}
