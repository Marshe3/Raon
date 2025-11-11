package com.example.raon.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Background Image DTO
 * PersoAI API의 배경 이미지 정보를 담는 데이터 전송 객체
 */
@Data
public class BackgroundImageDto {
    private String backgroundImageId;
    private String name;
    private String imageUrl;
    private LocalDateTime createdAt;
}