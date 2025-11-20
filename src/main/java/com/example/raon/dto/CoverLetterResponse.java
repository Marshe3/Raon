package com.example.raon.dto;

import com.example.raon.domain.CoverLetter;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CoverLetterResponse {
    private Long id;
    private String title;
    private String content;
    private String companyName;
    private String position;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CoverLetterResponse from(CoverLetter coverLetter) {
        return CoverLetterResponse.builder()
                .id(coverLetter.getId())
                .title(coverLetter.getTitle())
                .content(coverLetter.getContent())
                .companyName(coverLetter.getCompanyName())
                .position(coverLetter.getPosition())
                .isDefault(coverLetter.getIsDefault())
                .createdAt(coverLetter.getCreatedAt())
                .updatedAt(coverLetter.getUpdatedAt())
                .build();
    }
}
