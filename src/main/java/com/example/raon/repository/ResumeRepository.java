package com.example.raon.repository;

import com.example.raon.domain.Resume;
import com.example.raon.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    /**
     * 사용자별 이력서 목록 조회 (최신순)
     */
    List<Resume> findByUserOrderByCreatedAtDesc(User user);

    /**
     * 사용자별 이력서 목록 조회 by userId (최신순)
     */
    List<Resume> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 사용자별 이력서 개수 조회
     */
    long countByUser(User user);

    /**
     * 사용자별 이력서 개수 조회 by userId
     */
    long countByUser_UserId(Long userId);

    /**
     * 사용자의 기본 이력서 조회
     */
    Optional<Resume> findByUserAndIsDefaultTrue(User user);

    /**
     * 사용자의 기본 이력서 조회 by userId
     */
    Optional<Resume> findByUser_UserIdAndIsDefaultTrue(Long userId);
}
