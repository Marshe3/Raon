package com.example.raon.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이력서 엔티티
 * 사용자별로 최대 5개까지 저장 가능
 */
@Entity
@Table(name = "resume")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_id")
    private Long id;

    /**
     * 이력서 작성자 (User와 N:1 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 이력서 제목 (예: "네이버 지원용", "2025 상반기 취업용")
     */
    @Column(nullable = false, length = 100)
    private String title;

    /**
     * 이름
     */
    @Column(nullable = false, length = 50)
    private String name;

    /**
     * 연락처
     */
    @Column(length = 20)
    private String phone;

    /**
     * 이메일
     */
    @Column(length = 100)
    private String email;

    /**
     * 희망 직무 (예: "백엔드 개발자", "프론트엔드 개발자", "디자이너", "마케터")
     */
    @Column(name = "desired_position", length = 100)
    private String desiredPosition;

    /**
     * 기술/역량 (TEXT 타입으로 자유롭게 작성)
     * 개발자: "Java, Spring Boot, MySQL, Git"
     * 디자이너: "Photoshop, Illustrator, Figma"
     * 마케터: "SNS 마케팅, 데이터 분석, 구글 애널리틱스"
     */
    @Column(columnDefinition = "TEXT")
    private String skills;

    /**
     * 자기소개서 내용
     */
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    /**
     * 기본 이력서 여부 (true인 경우 면접 시 기본으로 사용)
     */
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    /**
     * 학력 목록 (1:N 관계)
     */
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educations = new ArrayList<>();

    /**
     * 경력 목록 (1:N 관계)
     */
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Career> careers = new ArrayList<>();

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
    public Resume(User user, String title, String name, String phone, String email,
                  String desiredPosition, String skills, String coverLetter, Boolean isDefault) {
        this.user = user;
        this.title = title;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.desiredPosition = desiredPosition;
        this.skills = skills;
        this.coverLetter = coverLetter;
        this.isDefault = isDefault != null ? isDefault : false;
    }

    /**
     * 기본 이력서로 설정
     */
    public void setAsDefault() {
        this.isDefault = true;
    }

    /**
     * 기본 이력서 해제
     */
    public void unsetAsDefault() {
        this.isDefault = false;
    }

    /**
     * 이력서 정보 업데이트
     */
    public void update(String title, String name, String phone, String email,
                       String desiredPosition, String skills, String coverLetter) {
        if (title != null) this.title = title;
        if (name != null) this.name = name;
        if (phone != null) this.phone = phone;
        if (email != null) this.email = email;
        if (desiredPosition != null) this.desiredPosition = desiredPosition;
        if (skills != null) this.skills = skills;
        if (coverLetter != null) this.coverLetter = coverLetter;
    }

    /**
     * 학력 추가
     */
    public void addEducation(Education education) {
        educations.add(education);
    }

    /**
     * 경력 추가
     */
    public void addCareer(Career career) {
        careers.add(career);
    }
}
