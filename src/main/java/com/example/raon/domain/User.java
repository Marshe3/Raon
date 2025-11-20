package com.example.raon.domain;


import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "user")
@Data

public class User {

	/**
	 * 사용자 고유 식별자 (Primary Key)
	 * 자동 증가 방식으로 생성
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long userId;

	/**
	 * 사용자 이메일 주소
	 * 최대 100자, 중복 불가
	 */
	@Column(length= 100, unique = true)
	private String email;

	/**
	 * 소셜 로그인 제공자 유형
	 * (예: KAKAO, NAVER, GOOGLE 등)
	 */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SocialType socialType;

	/**
	 * 소셜 로그인 제공자에서 제공하는 고유 식별자
	 * 최대 255자, 필수 값, 중복 불가
	 */
	@Column(length = 255, nullable = false, unique = true)
	private String socialId;

	/**
	 * 회원 가입 일시
	 * 엔티티 생성 시 자동으로 현재 시각이 설정되며, 수정 불가
	 */
	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime joinDate;

	/**
	 * 마지막 로그인 일시
	 * 사용자의 최근 접속 시간을 기록
	 */
	@Column(nullable = false)
	private LocalDateTime lastLogin;

	/**
	 * 프로필 이미지 URL
	 * 최대 500자
	 */
	@Column(length = 500)
	private String profileImage;

	/**
	 * 사용자 닉네임
	 * 최대 50자
	 */
	@Column(length = 50)
	private String nickname;

	/**
	 * 회원 탈퇴 일시
	 * null인 경우 활성 사용자, 값이 있는 경우 탈퇴한 사용자를 의미
	 * (소프트 삭제 방식)
	 */
	private LocalDateTime deletedAt;

	/**
	 * 레코드 생성 일시
	 * 엔티티가 데이터베이스에 처음 저장될 때 자동으로 설정되며, 수정 불가
	 */
	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	/**
	 * 레코드 최종 수정 일시
	 * 엔티티가 수정될 때마다 자동으로 현재 시각으로 갱신
	 */
	@UpdateTimestamp
	@Column(nullable = false)
	private LocalDateTime updatedAt;

}
