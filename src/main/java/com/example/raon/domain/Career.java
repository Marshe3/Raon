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
 * 경력 엔티티
 * Resume과 N:1 관계
 */
@Entity
@Table(name = "career")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "career_id")
    private Long id;

    /**
     * 소속 이력서 (Resume과 N:1 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    /**
     * 회사명
     */
    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    /**
     * 직무/직책
     */
    @Column(nullable = false, length = 100)
    private String position;

    /**
     * 근무기간 (예: "2020.03 ~ 2022.12")
     */
    @Column(name = "employment_period", length = 50)
    private String employmentPeriod;

    /**
     * 현재 재직중 여부
     */
    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = false;

    /**
     * 담당업무 (TEXT 타입으로 상세 기술)
     */
    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    /**
     * 성과 (TEXT 타입, 선택)
     */
    @Column(columnDefinition = "TEXT")
    private String achievements;

    /**
     * 정렬 순서 (여러 경력 정렬용)
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
    public Career(Resume resume, String companyName, String position, String employmentPeriod,
                  Boolean isCurrent, String responsibilities, String achievements, Integer orderIndex) {
        this.resume = resume;
        this.companyName = companyName;
        this.position = position;
        this.employmentPeriod = employmentPeriod;
        this.isCurrent = isCurrent != null ? isCurrent : false;
        this.responsibilities = responsibilities;
        this.achievements = achievements;
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }

    /**
     * 경력 정보 업데이트
     */
    public void update(String companyName, String position, String employmentPeriod,
                       Boolean isCurrent, String responsibilities, String achievements, Integer orderIndex) {
        if (companyName != null) this.companyName = companyName;
        if (position != null) this.position = position;
        if (employmentPeriod != null) this.employmentPeriod = employmentPeriod;
        if (isCurrent != null) this.isCurrent = isCurrent;
        if (responsibilities != null) this.responsibilities = responsibilities;
        if (achievements != null) this.achievements = achievements;
        if (orderIndex != null) this.orderIndex = orderIndex;
    }
}
