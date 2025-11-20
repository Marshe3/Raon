package com.example.raon.repository;

import com.example.raon.domain.CoverLetter;
import com.example.raon.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {

    /**
     * 사용자별 자소서 목록 조회 (최신순)
     */
    List<CoverLetter> findByUserOrderByCreatedAtDesc(User user);

    /**
     * 사용자별 자소서 목록 조회 by userId (최신순)
     */
    List<CoverLetter> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 사용자별 자소서 개수 조회
     */
    long countByUser(User user);

    /**
     * 사용자별 자소서 개수 조회 by userId
     */
    long countByUser_UserId(Long userId);

    /**
     * 사용자의 기본 자소서 조회
     */
    Optional<CoverLetter> findByUserAndIsDefaultTrue(User user);

    /**
     * 사용자의 기본 자소서 조회 by userId
     */
    Optional<CoverLetter> findByUser_UserIdAndIsDefaultTrue(Long userId);
}
