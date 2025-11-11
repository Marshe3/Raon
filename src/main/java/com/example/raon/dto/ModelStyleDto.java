package com.example.raon.dto;

import lombok.Data;
import java.util.List;

/**
 * Model Style DTO
 * PersoAI API의 AI 모델 스타일 정보를 담는 데이터 전송 객체
 */
@Data
public class ModelStyleDto {
    private String name;
    private String modelName;
    private List<String> styles;
}