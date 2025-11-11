package com.example.raon.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 사용자 OAuth 토큰 엔티티
 * 소셜 로그인을 통해 발급받은 Refresh Token을 암호화하여 저장하는 테이블
 */
@Entity
@Table(name = "user_oauth_token")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 기본 생성자, 외부 직접 생성 방지
public class UserOauthToken {

    /**
     * 토큰 고유 식별자 (Primary Key)
     * 자동 증가(AUTO_INCREMENT)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    private Long tokenId;

    /**
     * 사용자 ID (Foreign Key)
     * user 테이블의 user_id를 참조
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 소셜 로그인 타입 (Enum)
     * KAKAO, GOOGLE 등으로 구분
     */
    @Enumerated(EnumType.STRING) // Enum을 문자열로 DB에 저장
    @Column(name = "social_type", nullable = false)
    private SocialType socialType;

    /**
     * 암호화된 Refresh Token
     * 보안을 위해 암호화하여 저장
     */
    @Column(name = "encrypted_refresh_token", nullable = false, length = 500)
    private String encryptedRefreshToken;

    /**
     * 토큰 만료 시간
     * Refresh Token의 유효 기간
     */
    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    /**
     * 토큰 버전
     * 토큰 갱신 시 버전 관리를 위한 필드
     * 기본값: "1"
     */
    @Column(name = "token_version", nullable = false, length = 100)
    private String tokenVersion = "1";

    /**
     * 토큰 생성 시각
     * 자동으로 현재 시간이 설정됨 (DEFAULT CURRENT_TIMESTAMP)
     * 수정 불가 (updatable = false)
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * 토큰 수정 시각
     * 엔티티가 업데이트될 때마다 자동으로 현재 시간으로 갱신됨
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 엔티티 업데이트 전 실행되는 콜백 메서드
     * updated_at 필드를 현재 시간으로 자동 갱신
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 엔티티 저장 전 실행되는 콜백 메서드
     * updated_at 초기값 설정
     */
    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 빌더 패턴을 통한 엔티티 생성
     */
    @Builder
    public UserOauthToken(Long userId, SocialType socialType,
                          String encryptedRefreshToken, LocalDateTime tokenExpiresAt,
                          String tokenVersion) {
        this.userId = userId;
        this.socialType = socialType;
        this.encryptedRefreshToken = encryptedRefreshToken;
        this.tokenExpiresAt = tokenExpiresAt;
        this.tokenVersion = (tokenVersion != null) ? tokenVersion : "1";
    }

    /**
     * Refresh Token 업데이트 메서드
     */
    public void updateRefreshToken(String encryptedRefreshToken, LocalDateTime tokenExpiresAt) {
        this.encryptedRefreshToken = encryptedRefreshToken;
        this.tokenExpiresAt = tokenExpiresAt;
    }

    /**
     * 토큰 버전 증가 메서드
     */
    public void incrementTokenVersion() {
        int version = Integer.parseInt(this.tokenVersion);
        this.tokenVersion = String.valueOf(version + 1);
    }
}