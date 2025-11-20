package com.example.raon.controller;

import com.example.raon.dto.ResumeRequest;
import com.example.raon.dto.ResumeResponse;
import com.example.raon.security.UserPrincipal;
import com.example.raon.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 이력서 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    /**
     * 현재 사용자의 모든 이력서 조회
     * GET /api/resumes
     */
    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getAllResumes(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 이력서 목록 조회", userId);

        List<ResumeResponse> resumes = resumeService.getAllResumes(userId);
        return ResponseEntity.ok(resumes);
    }

    /**
     * 특정 이력서 조회
     * GET /api/resumes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 이력서 {} 조회", userId, id);

        try {
            ResumeResponse resume = resumeService.getResume(id, userId);
            return ResponseEntity.ok(resume);
        } catch (RuntimeException e) {
            log.error("이력서 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(404).build();
        }
    }

    /**
     * 이력서 생성
     * POST /api/resumes
     */
    @PostMapping
    public ResponseEntity<ResumeResponse> createResume(
            @RequestBody ResumeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 이력서 생성: {}", userId, request.getTitle());

        try {
            ResumeResponse resume = resumeService.createResume(userId, request);
            return ResponseEntity.ok(resume);
        } catch (RuntimeException e) {
            log.error("이력서 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 이력서 수정
     * PUT /api/resumes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResumeResponse> updateResume(
            @PathVariable Long id,
            @RequestBody ResumeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 이력서 {} 수정", userId, id);

        try {
            ResumeResponse resume = resumeService.updateResume(id, userId, request);
            return ResponseEntity.ok(resume);
        } catch (RuntimeException e) {
            log.error("이력서 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 이력서 삭제
     * DELETE /api/resumes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 이력서 {} 삭제", userId, id);

        try {
            resumeService.deleteResume(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("이력서 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 기본 이력서로 설정
     * PUT /api/resumes/{id}/default
     */
    @PutMapping("/{id}/default")
    public ResponseEntity<Void> setAsDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = principal.getUserId();
        log.info("사용자 {} 의 이력서 {} 를 기본으로 설정", userId, id);

        try {
            resumeService.setAsDefault(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("기본 이력서 설정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
