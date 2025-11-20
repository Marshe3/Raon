package com.example.raon.repository;

import com.example.raon.domain.Career;
import com.example.raon.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {

    /**
     * 이력서별 경력 목록 조회 (순서대로 정렬)
     */
    List<Career> findByResumeOrderByOrderIndexAsc(Resume resume);

    /**
     * 이력서별 경력 목록 조회 by resumeId (순서대로 정렬)
     */
    List<Career> findByResume_IdOrderByOrderIndexAsc(Long resumeId);

    /**
     * 이력서별 경력 삭제
     */
    void deleteByResume(Resume resume);
}
