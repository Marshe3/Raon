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
 * 자소서 엔티티
 * 사용자별로 최대 5개까지 저장 가능
 */
@Entity
@Table(name = "cover_letter")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CoverLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cover_letter_id")
    private Long id;

    /**
     * 자소서 작성자 (User와 N:1 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 자소서 제목 (예: "네이버 자소서", "카카오 지원용")
     */
    @Column(nullable = false, length = 100)
    private String title;

    /**
     * 자소서 내용 (TEXT 타입으로 자유롭게 작성)
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 지원 회사 (참고용, 선택)
     */
    @Column(name = "company_name", length = 100)
    private String companyName;

    /**
     * 지원 직무 (참고용, 선택)
     */
    @Column(length = 100)
    private String position;

    /**
     * 기본 자소서 여부 (true인 경우 면접 시 기본으로 사용)
     */
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

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
    public CoverLetter(User user, String title, String content, String companyName,
                       String position, Boolean isDefault) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.companyName = companyName;
        this.position = position;
        this.isDefault = isDefault != null ? isDefault : false;
    }

    /**
     * 기본 자소서로 설정
     */
    public void setAsDefault() {
        this.isDefault = true;
    }

    /**
     * 기본 자소서 해제
     */
    public void unsetAsDefault() {
        this.isDefault = false;
    }

    /**
     * 자소서 정보 업데이트
     */
    public void update(String title, String content, String companyName, String position) {
        if (title != null) this.title = title;
        if (content != null) this.content = content;
        if (companyName != null) this.companyName = companyName;
        if (position != null) this.position = position;
    }
}
