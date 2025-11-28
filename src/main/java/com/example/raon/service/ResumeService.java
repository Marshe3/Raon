package com.example.raon.service;

import com.example.raon.domain.Career;
import com.example.raon.domain.Education;
import com.example.raon.domain.Resume;
import com.example.raon.domain.User;
import com.example.raon.dto.ResumeRequest;
import com.example.raon.dto.ResumeResponse;
import com.example.raon.repository.CareerRepository;
import com.example.raon.repository.EducationRepository;
import com.example.raon.repository.ResumeRepository;
import com.example.raon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final EducationRepository educationRepository;
    private final CareerRepository careerRepository;
    private final UserRepository userRepository;

    private static final int MAX_RESUME_COUNT = 5;

    /**
     * 사용자의 모든 이력서 조회
     */
    public List<ResumeResponse> getAllResumes(Long userId) {
        return resumeRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(ResumeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 이력서 조회
     */
    public ResumeResponse getResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("이력서를 찾을 수 없습니다."));

        if (!resume.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        return ResumeResponse.from(resume);
    }

    /**
     * 이력서 생성
     */
    @Transactional
    public ResumeResponse createResume(Long userId, ResumeRequest request) {
        // 최대 개수 체크
        long count = resumeRepository.countByUser_UserId(userId);
        if (count >= MAX_RESUME_COUNT) {
            throw new RuntimeException("이력서는 최대 " + MAX_RESUME_COUNT + "개까지만 생성할 수 있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 기본 이력서로 설정하는 경우 기존 기본 이력서 해제
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetAllDefaultResumes(userId);
        }

        // 이력서 생성
        Resume resume = Resume.builder()
                .user(user)
                .title(request.getTitle())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .desiredPosition(request.getDesiredPosition())
                .skills(request.getSkills())
                .coverLetter(request.getCoverLetter())
                .isDefault(request.getIsDefault())
                .build();

        resume = resumeRepository.save(resume);

        // 학력 추가
        if (request.getEducations() != null) {
            for (ResumeRequest.EducationDto eduDto : request.getEducations()) {
                Education education = Education.builder()
                        .resume(resume)
                        .educationType(eduDto.getEducationType())
                        .schoolName(eduDto.getSchoolName())
                        .major(eduDto.getMajor())
                        .attendancePeriod(eduDto.getAttendancePeriod())
                        .status(eduDto.getStatus())
                        .gpa(eduDto.getGpa())
                        .orderIndex(eduDto.getOrderIndex())
                        .build();
                educationRepository.save(education);
                resume.addEducation(education);
            }
        }

        // 경력 추가
        if (request.getCareers() != null) {
            for (ResumeRequest.CareerDto careerDto : request.getCareers()) {
                Career career = Career.builder()
                        .resume(resume)
                        .companyName(careerDto.getCompanyName())
                        .position(careerDto.getPosition())
                        .employmentPeriod(careerDto.getEmploymentPeriod())
                        .isCurrent(careerDto.getIsCurrent())
                        .responsibilities(careerDto.getResponsibilities())
                        .achievements(careerDto.getAchievements())
                        .orderIndex(careerDto.getOrderIndex())
                        .build();
                careerRepository.save(career);
                resume.addCareer(career);
            }
        }

        return ResumeResponse.from(resume);
    }

    /**
     * 이력서 수정
     */
    @Transactional
    public ResumeResponse updateResume(Long resumeId, Long userId, ResumeRequest request) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("이력서를 찾을 수 없습니다."));

        if (!resume.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 기본 이력서로 설정하는 경우 기존 기본 이력서 해제
        if (Boolean.TRUE.equals(request.getIsDefault()) && !resume.getIsDefault()) {
            unsetAllDefaultResumes(userId);
            resume.setAsDefault();
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && resume.getIsDefault()) {
            resume.unsetAsDefault();
        }

        // 이력서 기본 정보 업데이트
        resume.update(
                request.getTitle(),
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getDesiredPosition(),
                request.getSkills(),
                request.getCoverLetter()
        );

        // 기존 학력, 경력 삭제 후 재생성 (단순화)
        educationRepository.deleteByResume(resume);
        careerRepository.deleteByResume(resume);

        // 학력 추가
        if (request.getEducations() != null) {
            for (ResumeRequest.EducationDto eduDto : request.getEducations()) {
                Education education = Education.builder()
                        .resume(resume)
                        .educationType(eduDto.getEducationType())
                        .schoolName(eduDto.getSchoolName())
                        .major(eduDto.getMajor())
                        .attendancePeriod(eduDto.getAttendancePeriod())
                        .status(eduDto.getStatus())
                        .gpa(eduDto.getGpa())
                        .orderIndex(eduDto.getOrderIndex())
                        .build();
                educationRepository.save(education);
            }
        }

        // 경력 추가
        if (request.getCareers() != null) {
            for (ResumeRequest.CareerDto careerDto : request.getCareers()) {
                Career career = Career.builder()
                        .resume(resume)
                        .companyName(careerDto.getCompanyName())
                        .position(careerDto.getPosition())
                        .employmentPeriod(careerDto.getEmploymentPeriod())
                        .isCurrent(careerDto.getIsCurrent())
                        .responsibilities(careerDto.getResponsibilities())
                        .achievements(careerDto.getAchievements())
                        .orderIndex(careerDto.getOrderIndex())
                        .build();
                careerRepository.save(career);
            }
        }

        return ResumeResponse.from(resumeRepository.findById(resumeId).get());
    }

    /**
     * 이력서 삭제
     */
    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("이력서를 찾을 수 없습니다."));

        if (!resume.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        resumeRepository.delete(resume);
    }

    /**
     * 기본 이력서로 설정
     */
    @Transactional
    public void setAsDefault(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("이력서를 찾을 수 없습니다."));

        if (!resume.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 기존 기본 이력서 해제
        unsetAllDefaultResumes(userId);

        // 새로운 기본 이력서 설정
        resume.setAsDefault();
    }

    /**
     * 사용자의 모든 기본 이력서 해제
     */
    private void unsetAllDefaultResumes(Long userId) {
        List<Resume> resumes = resumeRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        resumes.stream()
                .filter(Resume::getIsDefault)
                .forEach(Resume::unsetAsDefault);
    }
}
