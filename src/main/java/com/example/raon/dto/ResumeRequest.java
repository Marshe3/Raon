package com.example.raon.dto;

import lombok.Data;

import java.util.List;

@Data
public class ResumeRequest {
    private String title;
    private String name;
    private String phone;
    private String email;
    private String desiredPosition;
    private String skills;
    private Boolean isDefault;
    private List<EducationDto> educations;
    private List<CareerDto> careers;

    @Data
    public static class EducationDto {
        private Long id; // 수정 시 사용
        private String educationType;
        private String schoolName;
        private String major;
        private String attendancePeriod;
        private String status;
        private String gpa;
        private Integer orderIndex;
    }

    @Data
    public static class CareerDto {
        private Long id; // 수정 시 사용
        private String companyName;
        private String position;
        private String employmentPeriod;
        private Boolean isCurrent;
        private String responsibilities;
        private String achievements;
        private Integer orderIndex;
    }
}
