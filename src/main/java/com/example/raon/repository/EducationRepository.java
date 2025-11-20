package com.example.raon.repository;

import com.example.raon.domain.Education;
import com.example.raon.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {

    /**
     * 이력서별 학력 목록 조회 (순서대로 정렬)
     */
    List<Education> findByResumeOrderByOrderIndexAsc(Resume resume);

    /**
     * 이력서별 학력 목록 조회 by resumeId (순서대로 정렬)
     */
    List<Education> findByResume_IdOrderByOrderIndexAsc(Long resumeId);

    /**
     * 이력서별 학력 삭제
     */
    void deleteByResume(Resume resume);
}
