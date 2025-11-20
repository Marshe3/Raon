package com.example.raon.dto;

import lombok.Data;

@Data
public class CoverLetterRequest {
    private String title;
    private String content;
    private String companyName;
    private String position;
    private Boolean isDefault;
}
