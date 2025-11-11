package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Document DTO
 * PersoAI API의 Document 정보를 담는 데이터 전송 객체
 */
@Data
public class DocumentDto {
    private String documentId;
    private String name;
    private String fileUrl;
    private LocalDateTime createdAt;
}