package com.example.raon.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 학력 엔티티
 * Resume과 N:1 관계
 */
@Entity
@Table(name = "education")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "education_id")
    private Long id;

    /**
     * 소속 이력서 (Resume과 N:1 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    /**
     * 학력 구분 (예: "고등학교", "대학교(학사)", "대학원(석사)", "대학원(박사)", "기타")
     */
    @Column(name = "education_type", nullable = false, length = 50)
    private String educationType;

    /**
     * 학교명
     */
    @Column(name = "school_name", nullable = false, length = 100)
    private String schoolName;

    /**
     * 전공 (고졸의 경우 null 가능)
     */
    @Column(length = 100)
    private String major;

    /**
     * 재학기간 (예: "2018.03 ~ 2022.02")
     */
    @Column(name = "attendance_period", length = 50)
    private String attendancePeriod;

    /**
     * 상태 (예: "졸업", "재학중", "중퇴", "수료")
     */
    @Column(length = 20)
    private String status;

    /**
     * 학점 (선택)
     */
    @Column(length = 20)
    private String gpa;

    /**
     * 정렬 순서 (여러 학력 정렬용)
     */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    /**
     * 생성 일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 일시
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Education(Resume resume, String educationType, String schoolName, String major,
                     String attendancePeriod, String status, String gpa, Integer orderIndex) {
        this.resume = resume;
        this.educationType = educationType;
        this.schoolName = schoolName;
        this.major = major;
        this.attendancePeriod = attendancePeriod;
        this.status = status;
        this.gpa = gpa;
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }

    /**
     * 학력 정보 업데이트
     */
    public void update(String educationType, String schoolName, String major,
                       String attendancePeriod, String status, String gpa, Integer orderIndex) {
        if (educationType != null) this.educationType = educationType;
        if (schoolName != null) this.schoolName = schoolName;
        if (major != null) this.major = major;
        if (attendancePeriod != null) this.attendancePeriod = attendancePeriod;
        if (status != null) this.status = status;
        if (gpa != null) this.gpa = gpa;
        if (orderIndex != null) this.orderIndex = orderIndex;
    }
}
