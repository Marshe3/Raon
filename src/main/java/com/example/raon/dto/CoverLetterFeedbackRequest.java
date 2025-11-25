package com.example.raon.dto;

import lombok.Data;

@Data
public class CoverLetterFeedbackRequest {
    private String coverLetter;
    private String name;
    private String desiredPosition;
    private String skills;
    private String schoolName;
    private String major;
    private String companyName;
    private String position;
}
