package com.example.raon.dto;

import com.example.raon.domain.Resume;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ResumeResponse {
    private Long id;
    private String title;
    private String name;
    private String phone;
    private String email;
    private String desiredPosition;
    private String skills;
    private Boolean isDefault;
    private List<EducationDto> educations;
    private List<CareerDto> careers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class EducationDto {
        private Long id;
        private String educationType;
        private String schoolName;
        private String major;
        private String attendancePeriod;
        private String status;
        private String gpa;
        private Integer orderIndex;
    }

    @Data
    @Builder
    public static class CareerDto {
        private Long id;
        private String companyName;
        private String position;
        private String employmentPeriod;
        private Boolean isCurrent;
        private String responsibilities;
        private String achievements;
        private Integer orderIndex;
    }

    public static ResumeResponse from(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .title(resume.getTitle())
                .name(resume.getName())
                .phone(resume.getPhone())
                .email(resume.getEmail())
                .desiredPosition(resume.getDesiredPosition())
                .skills(resume.getSkills())
                .isDefault(resume.getIsDefault())
                .educations(resume.getEducations().stream()
                        .map(edu -> EducationDto.builder()
                                .id(edu.getId())
                                .educationType(edu.getEducationType())
                                .schoolName(edu.getSchoolName())
                                .major(edu.getMajor())
                                .attendancePeriod(edu.getAttendancePeriod())
                                .status(edu.getStatus())
                                .gpa(edu.getGpa())
                                .orderIndex(edu.getOrderIndex())
                                .build())
                        .collect(Collectors.toList()))
                .careers(resume.getCareers().stream()
                        .map(career -> CareerDto.builder()
                                .id(career.getId())
                                .companyName(career.getCompanyName())
                                .position(career.getPosition())
                                .employmentPeriod(career.getEmploymentPeriod())
                                .isCurrent(career.getIsCurrent())
                                .responsibilities(career.getResponsibilities())
                                .achievements(career.getAchievements())
                                .orderIndex(career.getOrderIndex())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }
}
