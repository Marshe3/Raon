// RaonResume.jsx
import React, { useState } from 'react';
import './RaonResume.css';
import CustomSelect from './CustomSelect';
import CustomDate from './CustomDate';

const RaonResume = () => {
  const [currentPage, setCurrentPage] = useState('list');
  const [currentTab, setCurrentTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalTabs = 5;

  // ✅ localStorage에서 이력서 데이터 불러오기
  const [resumes, setResumes] = useState(() => {
    const saved = localStorage.getItem('raon_resumes');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDefaultResume, setIsDefaultResume] = useState(false);
  
  // ✅ 수정 모드 상태 추가
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState(null);
  
  // ✅ 보기 모드 상태 추가
  const [isViewMode, setIsViewMode] = useState(false);

  // ✅ resumes가 변경될 때마다 localStorage에 저장
  React.useEffect(() => {
    localStorage.setItem('raon_resumes', JSON.stringify(resumes));
  }, [resumes]);

  // ✅ 탭 전환 시 스크롤 맨 위로
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  // ✅ 폼 입력 필드 상태
  const [resumeTitle, setResumeTitle] = useState('');
  const [userName, setUserName] = useState('');

  // 학력 날짜
  const [educationStartDate, setEducationStartDate] = useState('');
  const [educationEndDate, setEducationEndDate] = useState('');

  // 경력 날짜
  const [careerStartDate, setCareerStartDate] = useState('');
  const [careerEndDate, setCareerEndDate] = useState('');
  const [isCurrentJob, setIsCurrentJob] = useState(false);

  // 학력 select 상태
  const [educationStatus, setEducationStatus] = useState('');
  const [educationType, setEducationType] = useState('');

  // 자기소개서 관련 상태
  const [showFeedback, setShowFeedback] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  // 취소 확인 모달
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // ✅ 삭제 확인 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  
  // ✅ 수정 확인 모달
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // ✅ 기본 이력서 설정 확인 모달
  const [showSetDefaultModal, setShowSetDefaultModal] = useState(false);
  const [resumeToSetDefault, setResumeToSetDefault] = useState(null);

  // 폼 전체 초기화
  const resetForm = () => {
    setCurrentTab(0);
    setResumeTitle(''); // ✅ 제목 초기화
    setUserName(''); // ✅ 이름 초기화
    setEducationStartDate('');
    setEducationEndDate('');
    setCareerStartDate('');
    setCareerEndDate('');
    setIsCurrentJob(false);
    setEducationStatus('');
    setEducationType('');
    setShowFeedback(false);
    setCoverLetter('');
    setShowApplyModal(false);
    setShowEmptyModal(false);
    setIsDefaultResume(false);
    setIsEditMode(false); // ✅ 수정 모드 초기화
    setEditingResumeId(null); // ✅ 편집 중인 ID 초기화
    setIsViewMode(false); // ✅ 보기 모드 초기화
  };

  // 페이지 전환
  const navigateToForm = () => {
    resetForm();
    setCurrentPage('form');
    setCurrentTab(0);
  };

  const navigateToList = () => {
    setCurrentPage('list');
    setCurrentTab(0);
  };

  // 탭 관리
  const switchTab = (index) => setCurrentTab(index);

  const nextTab = () => {
    if (currentTab < totalTabs - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const prevTab = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  // 모달 관리
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 날짜 기간 계산 함수
  const calculatePeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0 && months === 0) {
      return '1개월 미만';
    }

    let result = '';
    if (years > 0) result += `${years}년 `;
    if (months > 0) result += `${months}개월`;

    return result.trim();
  };

  // AI 첨삭 요청 함수
  const handleAIFeedback = () => {
    if (!coverLetter.trim()) {
      setShowEmptyModal(true);
      return;
    }
    setShowFeedback(true);
  };

  // 저장 버튼
  const handleSaveResume = () => {
    if (isEditMode) {
      // ✅ 수정 모드: 확인 모달 띄우기
      setShowUpdateModal(true);
    } else {
      // ✅ 새 이력서 생성
      saveResume();
    }
  };

  // ✅ 실제 저장/수정 로직
  const saveResume = () => {
    if (isEditMode) {
      // 기존 이력서 업데이트
      setResumes((prev) =>
        prev.map((resume) => {
          if (resume.id === editingResumeId) {
            if (isDefaultResume) {
              prev.forEach((r) => {
                if (r.id !== editingResumeId) r.isDefault = false;
              });
            }
            return {
              ...resume,
              title: resumeTitle || '새 이력서', // ✅ 제목 저장
              name: userName || '', // ✅ 이름 저장
              hasAIFeedback: showFeedback,
              isDefault: isDefaultResume,
            };
          }
          if (isDefaultResume) {
            return { ...resume, isDefault: false };
          }
          return resume;
        })
      );
    } else {
      // 새 이력서 생성
      const newResume = {
        id: Date.now(),
        title: resumeTitle || '새 이력서', // ✅ 제목 저장
        name: userName || '', // ✅ 이름 저장
        createdAt: new Date().toISOString(),
        hasAIFeedback: showFeedback,
        isDefault: isDefaultResume,
      };

      setResumes((prev) => {
        const updatedPrev = isDefaultResume
          ? prev.map((resume) => ({ ...resume, isDefault: false }))
          : prev;
        return [...updatedPrev, newResume];
      });
    }

    resetForm();
    navigateToList();
  };

  // ✅ 수정 확인 모달에서 확인 클릭
  const confirmUpdate = () => {
    setShowUpdateModal(false);
    saveResume();
  };

  // ✅ 수정 1: 삭제 버튼 - 모달 띄우기
  const handleDeleteResume = (resumeId) => {
    setResumeToDelete(resumeId);
    setShowDeleteModal(true);
  };

  // ✅ 삭제 확정
  const confirmDelete = () => {
    setResumes((prev) => prev.filter((r) => r.id !== resumeToDelete));
    setShowDeleteModal(false);
    setResumeToDelete(null);
  };

  // ✅ 수정 버튼 - 기존 데이터 로드하고 폼으로 이동
  const handleEditResume = (resume) => {
    setIsEditMode(true);
    setIsViewMode(false);
    setEditingResumeId(resume.id);
    setIsDefaultResume(resume.isDefault);
    setShowFeedback(resume.hasAIFeedback);
    setResumeTitle(resume.title || ''); // ✅ 제목 로드
    setUserName(resume.name || ''); // ✅ 이름 로드
    // TODO: 실제로는 여기서 resume의 모든 데이터를 각 필드에 채워야 함
    setCurrentPage('form');
    setCurrentTab(0);
  };

  // ✅ 보기 버튼 - 읽기 전용으로 폼으로 이동
  const handleViewResume = (resume) => {
    setIsViewMode(true);
    setIsEditMode(false);
    setEditingResumeId(resume.id);
    setIsDefaultResume(resume.isDefault);
    setShowFeedback(resume.hasAIFeedback);
    setResumeTitle(resume.title || '');
    setUserName(resume.name || '');
    // TODO: 실제로는 여기서 resume의 모든 데이터를 각 필드에 채워야 함
    setCurrentPage('form');
    setCurrentTab(0);
  };

  // ✅ 기본 이력서로 설정 버튼 클릭
  const handleSetDefaultResume = (resumeId) => {
    setResumeToSetDefault(resumeId);
    setShowSetDefaultModal(true);
  };

  // ✅ 기본 이력서로 설정 확정
  const confirmSetDefault = () => {
    setResumes((prev) => {
      // 모든 이력서의 isDefault를 false로 설정
      const updated = prev.map((resume) => ({
        ...resume,
        isDefault: resume.id === resumeToSetDefault,
      }));
      
      // 기본 이력서로 설정된 이력서를 맨 앞으로 이동
      const defaultResume = updated.find((r) => r.id === resumeToSetDefault);
      const otherResumes = updated.filter((r) => r.id !== resumeToSetDefault);
      
      return [defaultResume, ...otherResumes];
    });
    
    setShowSetDefaultModal(false);
    setResumeToSetDefault(null);
  };

  const handleApplyFeedback = () => {
    setShowApplyModal(true);
  };

  const confirmApplyFeedback = () => {
    setShowApplyModal(false);
    setShowFeedback(false);
  };

  // 취소 버튼
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const confirmCancelAndExit = () => {
    setShowCancelModal(false);
    resetForm();
    navigateToList();
  };

  // ==================== 이력서 작성 폼 페이지 ====================
  const renderFormPage = () => (
    <div className="resume-form-page">
      <div className="container">
        <div className="form-header">
          <h1 className="form-title">
            {isViewMode ? '이력서 보기' : isEditMode ? '이력서 수정' : '새 이력서 작성'}
          </h1>
          <p className="form-subtitle">
            {isViewMode 
              ? '작성하신 이력서를 확인하세요' 
              : '필요한 정보를 입력해주세요. 필수 항목(*)은 반드시 입력해야 합니다.'
            }
          </p>
        </div>

        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${currentTab === 0 ? 'active' : ''}`}
              onClick={() => switchTab(0)}
            >
              기본 정보
            </button>
            <button
              className={`tab-btn ${currentTab === 1 ? 'active' : ''}`}
              onClick={() => switchTab(1)}
            >
              기술/역량
            </button>
            <button
              className={`tab-btn ${currentTab === 2 ? 'active' : ''}`}
              onClick={() => switchTab(2)}
            >
              학력/경력
            </button>
            <button
              className={`tab-btn ${currentTab === 3 ? 'active' : ''}`}
              onClick={() => switchTab(3)}
            >
              자기소개서
            </button>
            <button
              className={`tab-btn ${currentTab === 4 ? 'active' : ''}`}
              onClick={() => switchTab(4)}
            >
              완료
            </button>
          </div>

          {/* 탭 1: 기본 정보 */}
          <div className={`tab-content ${currentTab === 0 ? 'active' : ''}`}>
            <div className="tab-header">
              <h2 className="tab-title">기본 정보</h2>
              <p className="tab-description">
                이력서의 기본이 되는 정보를 입력해주세요
              </p>
            </div>

            <div className="form-field">
              <label className="field-label">
                이력서 제목<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                className="field-input"
                placeholder="예: 네이버 지원용"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                readOnly={isViewMode}
                disabled={isViewMode}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                이름<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                className="field-input"
                placeholder="홍길동"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                readOnly={isViewMode}
                disabled={isViewMode}
              />
            </div>

            <div className="form-field">
              <label className="field-label">연락처</label>
              <input
                type="tel"
                className="field-input"
                placeholder="010-1234-5678"
              />
            </div>

            <div className="form-field">
              <label className="field-label">이메일</label>
              <input
                type="email"
                className="field-input"
                placeholder="example@email.com"
              />
            </div>

            <div className="form-field">
              <label className="field-label">희망 직무</label>
              <input
                type="text"
                className="field-input"
                placeholder="예: 백엔드 개발자"
              />
            </div>
          </div>

          {/* 탭 2: 기술/역량 */}
          <div className={`tab-content ${currentTab === 1 ? 'active' : ''}`}>
            <div className="tab-header">
              <h2 className="tab-title">기술/역량</h2>
              <p className="tab-description">
                보유하고 계신 기술과 역량을 작성해주세요
              </p>
            </div>

            <div className="form-field">
              <textarea
                className="field-textarea"
                placeholder="예: Java, Spring Boot, MySQL, Redis, Docker"
                rows="8"
              ></textarea>
            </div>

            <div className="tip-box">
              <div className="tip-title">💡 작성 팁</div>
              <div className="tip-text">
                <p>
                  사용 가능한 기술 스택, 프레임워크, 도구 등을 구체적으로
                  작성해주세요.
                </p>
                <p>
                  숙련도별로 구분하여 작성하면 더욱 좋습니다. 예를 들어,
                  &quot;상: Java, Spring&quot;, &quot;중: Python, Django&quot;
                  형태로 작성할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 탭 3: 학력/경력 */}
          <div className={`tab-content ${currentTab === 2 ? 'active' : ''}`}>
            <div className="tab-header">
              <h2 className="tab-title">학력/경력</h2>
              <p className="tab-description">
                학력 및 경력 사항을 입력해주세요
              </p>
            </div>

            {/* 학력 */}
            <div className="section-title">학력</div>

            <div className="form-row">
              <div className="form-field">
                <label className="field-label">학교명</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="예: 한국대학교"
                />
              </div>
              <div className="form-field">
                <label className="field-label">전공</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="고졸인 경우 비워두셔도 됩니다"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field select-field">
                <label className="field-label">상태</label>
                <CustomSelect
                  value={educationStatus}
                  onChange={(e) => setEducationStatus(e.target.value)}
                  options={[
                    { value: '', label: '선택' },
                    { value: '졸업', label: '졸업' },
                    { value: '재학 중', label: '재학 중' },
                    { value: '휴학 중', label: '휴학 중' },
                    { value: '중퇴', label: '중퇴' },
                  ]}
                  placeholder="선택"
                />
              </div>
              <div className="form-field select-field">
                <label className="field-label">학력 구분</label>
                <CustomSelect
                  value={educationType}
                  onChange={(e) => setEducationType(e.target.value)}
                  options={[
                    { value: '', label: '선택' },
                    { value: '고등학교', label: '고등학교' },
                    { value: '전문대학교', label: '전문대학교' },
                    { value: '대학교', label: '대학교' },
                    { value: '대학원', label: '대학원' },
                  ]}
                  placeholder="선택"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="field-label">시작일</label>
                <CustomDate
                  value={educationStartDate}
                  onChange={(e) => setEducationStartDate(e.target.value)}
                  placeholder="시작일을 선택하세요"
                />
              </div>
              <div className="form-field">
                <label className="field-label">종료일</label>
                <CustomDate
                  value={educationEndDate}
                  onChange={(e) => setEducationEndDate(e.target.value)}
                  placeholder="종료일을 선택하세요"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="field-label">재학기간 (자동생성)</label>
                <input
                  type="text"
                  className="field-input field-auto"
                  value={calculatePeriod(educationStartDate, educationEndDate)}
                  placeholder="시작일과 종료일을 선택하세요"
                  readOnly
                />
              </div>
              <div className="form-field">
                <label className="field-label">학점 (선택)</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="예: 4.0/4.5"
                />
              </div>
            </div>

            {/* 경력 */}
            <div className="section-divider">
              <div className="section-title">경력</div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="field-label">회사명</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="예: (주)테크컴퍼니"
                />
              </div>
              <div className="form-field">
                <label className="field-label">직무/직책</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="예: 백엔드 개발자"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="field-label">시작일</label>
                <CustomDate
                  value={careerStartDate}
                  onChange={(e) => setCareerStartDate(e.target.value)}
                  placeholder="시작일을 선택하세요"
                />
              </div>
              <div className="form-field">
                <label className="field-label">종료일</label>
                {!isCurrentJob ? (
                  <CustomDate
                    value={careerEndDate}
                    onChange={(e) => setCareerEndDate(e.target.value)}
                    placeholder="종료일을 선택하세요"
                  />
                ) : (
                  <input
                    type="text"
                    className="field-input"
                    value="재직중"
                    disabled
                    style={{ background: '#f1f5f9', color: '#94a3b8' }}
                  />
                )}
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">근무기간 (자동생성)</label>
              <input
                type="text"
                className="field-input field-auto"
                value={
                  isCurrentJob
                    ? careerStartDate
                      ? `${calculatePeriod(
                          careerStartDate,
                          new Date().toISOString().split('T')[0],
                        )} (재직중)`
                      : ''
                    : calculatePeriod(careerStartDate, careerEndDate)
                }
                placeholder="시작일과 종료일을 선택하세요"
                readOnly
              />
              <div className="checkbox-inline">
                <input
                  type="checkbox"
                  id="currentJob"
                  className="checkbox-small"
                  checked={isCurrentJob}
                  onChange={(e) => {
                    setIsCurrentJob(e.target.checked);
                    if (e.target.checked) {
                      setCareerEndDate('');
                    }
                  }}
                />
                <label
                  htmlFor="currentJob"
                  className="checkbox-label-small"
                >
                  현재 재직중
                </label>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">담당업무</label>
              <textarea
                className="field-textarea"
                placeholder="담당했던 업무를 자유롭게 작성해주세요"
                rows="4"
              ></textarea>
            </div>

            <div className="form-field">
              <label className="field-label">성과 (선택)</label>
              <textarea
                className="field-textarea"
                placeholder="업무 성과를 자유롭게 작성해주세요"
                rows="4"
              ></textarea>
            </div>
          </div>

          {/* 탭 4: 자기소개서 */}
          <div className={`tab-content ${currentTab === 3 ? 'active' : ''}`}>
            <div className="tab-header">
              <h2 className="tab-title">자기소개서</h2>
              <p className="tab-description">
                지원 동기와 포부를 자유롭게 작성해주세요
              </p>
            </div>

            <div className="coverletter-container">
              <div className="coverletter-write">
                <textarea
                  className="field-textarea coverletter-textarea"
                  placeholder="지원 동기, 성장 과정, 강점, 입사 후 포부 등을 자유롭게 작성해주세요."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows="15"
                ></textarea>

                <button
                  className="btn-ai-feedback"
                  onClick={handleAIFeedback}
                >
                  ✨ AI 첨삭 받기
                </button>

                {!showFeedback && (
                  <div className="tip-box">
                    <div className="tip-title">✨ AI 첨삭 안내</div>
                    <div className="tip-text">
                      이력서를 저장하면 작성하신 자기소개서에 대한 AI 첨삭을
                      받을 수 있습니다. 구체적인 개선 방안과 추천 수정안을
                      제공해드립니다.
                    </div>
                  </div>
                )}
              </div>

              {showFeedback && (
                <div className="coverletter-feedback">
                  <div className="feedback-header">
                    <h3 className="feedback-title-main">🤖 AI 첨삭 결과</h3>
                    <button
                      className="btn-close-feedback"
                      onClick={() => setShowFeedback(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="feedback-scroll">
                    <div className="feedback-block">
                      <div className="feedback-subtitle">👍 좋은 점</div>
                      <ul className="feedback-list">
                        <li>
                          본인의 전공과 관심사가 명확하게 드러나 있습니다.
                        </li>
                        <li>
                          팀 프로젝트 경험을 통한 협업 능력을 언급한 것이
                          좋습니다.
                        </li>
                      </ul>
                    </div>

                    <div className="feedback-block">
                      <div className="feedback-subtitle">💡 개선 제안</div>
                      <ul className="feedback-list">
                        <li>
                          구체적인 프로젝트 성과나 수치를 추가하면 더 설득력이
                          있을 것입니다.
                        </li>
                        <li>
                          &quot;사용자 경험 개선&quot;에 대한 구체적인 사례를
                          추가해보세요.
                        </li>
                        <li>
                          마지막 문단에 회사에 대한 관심과 기여 방안을 추가하면
                          좋습니다.
                        </li>
                      </ul>
                    </div>

                    <div className="feedback-block">
                      <div className="feedback-subtitle">✍️ 추천 수정안</div>
                      <div className="suggestion-box">
                        "저는 4년간 컴퓨터공학을 전공하며 사용자 중심의 웹
                        개발 역량을 키워왔습니다. 특히 '입양하냥 키워주개'
                        프로젝트에서 프론트엔드 개발을 담당하며 사용자 경험을
                        15% 개선한 경험이 있습니다..."
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-apply-inline"
                    onClick={handleApplyFeedback}
                  >
                    이 첨삭 내용을 자소서에 반영하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 탭 5: 완료 */}
          <div className={`tab-content ${currentTab === 4 ? 'active' : ''}`}>
            <div className="completion-container">
              <div className="completion-icon">🎉</div>
              <h2 className="completion-title">작성 완료!</h2>
              <p className="completion-text">
                이력서 작성이 거의 완료되었습니다
              </p>

              <div className="checkbox-box">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    id="defaultResume"
                    checked={isDefaultResume}
                    onChange={(e) => setIsDefaultResume(e.target.checked)}
                  />
                  <label
                    htmlFor="defaultResume"
                    className="checkbox-label"
                  >
                    이 이력서를 기본 이력서로 설정
                  </label>
                </div>
                <p className="checkbox-desc">
                  AI 면접 연습 시 이 이력서를 참고합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="action-bar" style={{ border: '1px solid #e2e8f0' }}>
          <div className="button-left">
            {!isViewMode && (
              <button
                className="btn btn-cancel"
                onClick={handleCancelClick}
                style={{
                  background: '#fee',
                  color: '#dc3545',
                  border: '1px solid #fcc',
                  opacity: '1',
                  visibility: 'visible',
                }}
              >
                취소
              </button>
            )}
            {/* ✅ 보기 모드: 자기소개서 탭 제외하고 확인 버튼 */}
            {isViewMode && currentTab !== 3 && (
              <button
                className="btn btn-confirm"
                onClick={navigateToList}
                style={{
                  background: '#10b981',
                  color: 'white',
                  opacity: '1',
                  visibility: 'visible',
                }}
              >
                확인
              </button>
            )}
          </div>
          <div
            className="button-right"
            style={{ opacity: '1', visibility: 'visible' }}
          >
            {!isViewMode && currentTab > 0 && (
              <button
                className="btn btn-prev"
                onClick={prevTab}
                style={{
                  opacity: '1',
                  visibility: 'visible',
                }}
              >
                이전
              </button>
            )}
            {isViewMode && currentTab > 0 && (
              <button
                className="btn btn-prev"
                onClick={prevTab}
                style={{
                  opacity: '1',
                  visibility: 'visible',
                }}
              >
                이전
              </button>
            )}
            {currentTab < totalTabs - 1 && (
              <button
                className="btn btn-next"
                onClick={isViewMode && currentTab === 3 ? navigateToList : nextTab}
                style={{
                  opacity: '1',
                  visibility: 'visible',
                  display: 'inline-block',
                }}
              >
                {isViewMode && currentTab === 3 ? '확인' : '다음'}
              </button>
            )}
            {!isViewMode && currentTab === totalTabs - 1 && (
              <button
                className="btn btn-save"
                onClick={handleSaveResume}
                style={{
                  opacity: '1',
                  visibility: 'visible',
                }}
              >
                {isEditMode ? '수정하기' : '저장하기'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div
          className="raon-modal-overlay"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="raon-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="raon-modal-title">AI 첨삭 반영 완료</h3>
            <p className="raon-modal-message">
              자기소개서에 AI 첨삭 내용이 적용되었어요.
            </p>
            <button
              className="raon-modal-btn"
              onClick={confirmApplyFeedback}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showEmptyModal && (
        <div
          className="raon-modal-overlay"
          onClick={() => setShowEmptyModal(false)}
        >
          <div
            className="raon-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="raon-modal-title">내용을 입력해주세요</h3>
            <p className="raon-modal-message">
              자기소개서 내용을 먼저 작성한 후 AI 첨삭을 요청할 수 있어요.
            </p>
            <button
              className="raon-modal-btn"
              onClick={() => setShowEmptyModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="raon-modal-overlay" onClick={closeCancelModal}>
          <div
            className="raon-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="raon-modal-title">작성 중인 내용이 사라집니다</h3>
            <p className="raon-modal-message">
              뒤로 나가면 현재 작성 중인 이력서/자기소개서 내용이 복구되지
              않습니다. 정말 나가시겠어요?
            </p>
            <div className="raon-modal-actions">
              <button
                className="raon-modal-btn-secondary"
                onClick={closeCancelModal}
              >
                계속 작성하기
              </button>
              <button
                className="raon-modal-btn"
                onClick={confirmCancelAndExit}
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 수정 확인 모달 */}
      {showUpdateModal && (
        <div className="raon-modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div
            className="raon-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="raon-modal-title">이력서를 수정하시겠어요?</h3>
            <p className="raon-modal-message">
              수정된 내용이 저장됩니다.
            </p>
            <div className="raon-modal-actions">
              <button
                className="raon-modal-btn-secondary"
                onClick={() => setShowUpdateModal(false)}
              >
                취소
              </button>
              <button
                className="raon-modal-btn"
                onClick={confirmUpdate}
              >
                수정하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== 이력서 목록 페이지 ====================
  const renderListPage = () => {
    // ✅ 기본 이력서를 맨 앞으로 정렬
    const sortedResumes = [...resumes].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });

    return (
      <div className="resume-list-page">
        <div className="container">
          <div className="header-section">
            <h1 className="page-title">
              <span className="title-icon">📋</span>
              이력서 관리
            </h1>
            <button className="btn-new-resume" onClick={navigateToForm}>
              <span>+</span>
              새 이력서 작성
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{resumes.length}</div>
              <div className="stat-label">작성된 이력서</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {resumes.filter((r) => r.isDefault).length}
              </div>
              <div className="stat-label">기본 이력서</div>
              <div className="stat-note">※ 기본 이력서는 1개만 지정 가능합니다</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {resumes.filter((r) => r.hasAIFeedback).length}
              </div>
              <div className="stat-label">AI 첨삭 이력서</div>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon-wrapper">
                <span className="empty-icon">📄</span>
              </div>
              <h2 className="empty-title">작성된 이력서가 없습니다</h2>
              <p className="empty-description">
                지금 바로 이력서를 작성하고 AI 첨삭을 받아보세요!
              </p>
              <button className="btn-start" onClick={navigateToForm}>
                지금 바로 시작하기
              </button>
            </div>
          ) : (
            <div className="resume-grid">
              {sortedResumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`resume-card ${
                    resume.isDefault ? 'is-default' : ''
                  }`}
                  onClick={() => handleViewResume(resume)}
                  style={{ cursor: 'pointer' }}
                >
                  {resume.isDefault && (
                    <>
                      <div className="default-indicator"></div>
                      <div className="default-badge">기본</div>
                    </>
                  )}

                  <div className="card-content">
                    <div className="card-title">
                      {resume.title || '새 이력서'}
                    </div>

                    <div className="info-list">
                      {/* ✅ 이름 표시 - 없으면 "이름없음" */}
                      <div className="info-item">
                        <span className="info-icon">👨‍💼</span>
                        <span className="info-value">{resume.name || '이름없음'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">📅</span>
                        <span className="info-value">
                          {new Date(resume.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">🙂</span>
                        <span className="info-value">
                          AI 첨삭 여부 :{' '}
                          {resume.hasAIFeedback ? '있음' : '없음'}
                        </span>
                      </div>
                    </div>

                    <div className="skills-box">
                      <span className="skills-label">요약</span>
                      <span>
                        기본정보, 기술/역량, 학력/경력, 자기소개서가 포함된
                        이력서입니다.
                      </span>
                    </div>
                  </div>

                  {/* ✅ 여기 카드 하단 버튼 부분 수정됨 */}
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    {/* AI 자소서 첨삭보기 */}
                    <button
                      className="btn-review"
                      type="button"
                      onClick={openModal}
                    >
                      AI 자소서 첨삭보기
                    </button>

                    {/* 기본 이력서 설정: 기본 이력서 카드에서는 버튼 자체를 렌더링하지 않고 빈 영역만 유지 */}
                    <div className="card-set-default-row">
                      {!resume.isDefault ? (
                        <button
                          className="btn-set-default"
                          type="button"
                          onClick={() => handleSetDefaultResume(resume.id)}
                        >
                          기본 이력서로 설정
                        </button>
                      ) : (
                        <div
                          className="btn-set-default--placeholder"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="card-action-buttons">
                      <button
                        className="btn-edit"
                        type="button"
                        onClick={() => handleEditResume(resume)}
                      >
                        수정
                      </button>
                      <button
                        className="btn-delete"
                        type="button"
                        onClick={() => handleDeleteResume(resume.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ AI 자소서 첨삭 모달 */}
        <div
          className={`modal-overlay ${isModalOpen ? 'active' : ''}`}
          onClick={closeModal}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">AI 자소서 첨삭</h2>
            </div>

            <div className="modal-body">
              <div className="original-section">
                <span className="section-label">📝 작성한 자소서</span>
                <div className="original-text">
                  저는 컴퓨터공학을 전공하며 웹 개발에 대한 열정을 키워왔습니다.
                  특히 사용자 경험을 개선하는 것에 큰 관심이 있으며,
                  프로젝트를 통해 React와 Spring Boot를 활용한 풀스택 개발
                  경험을 쌓았습니다.
                  <br />
                  <br />
                  팀 프로젝트에서 리더로서 팀원들과 소통하며 목표를 달성한
                  경험이 있으며, 이를 통해 협업의 중요성을 배웠습니다. 앞으로도
                  지속적으로 학습하며 성장하는 개발자가 되고 싶습니다.
                </div>
              </div>

              <div className="feedback-container">
                <h3 className="feedback-title">🤖 AI 첨삭 결과</h3>

                <div className="feedback-block">
                  <div className="feedback-subtitle">👍 좋은 점</div>
                  <ul className="feedback-list">
                    <li>
                      본인의 전공과 관심사가 명확하게 드러나 있습니다.
                    </li>
                    <li>
                      팀 프로젝트 경험을 통한 협업 능력을 언급한 것이 좋습니다.
                    </li>
                  </ul>
                </div>

                <div className="feedback-block">
                  <div className="feedback-subtitle">💡 개선 제안</div>
                  <ul className="feedback-list">
                    <li>
                      구체적인 프로젝트 성과나 수치를 추가하면 더 설득력이 있을
                      것입니다.
                    </li>
                    <li>
                      &quot;사용자 경험 개선&quot;에 대한 구체적인 사례를
                      추가해보세요.
                    </li>
                    <li>
                      마지막 문단에 회사에 대한 관심과 기여 방안을 추가하면
                      좋습니다.
                    </li>
                  </ul>
                </div>

                <div className="feedback-block">
                  <div className="feedback-subtitle">✍️ 추천 수정안</div>
                  <div className="suggestion-box">
                    "저는 4년간 컴퓨터공학을 전공하며 사용자 중심의 웹 개발
                    역량을 키워왔습니다. 특히 '입양하냥 키워주개' 프로젝트에서
                    프론트엔드 개발을 담당하며 사용자 경험을 15% 개선한 경험이
                    있습니다..."
                  </div>
                </div>

                {/* ✅ 버튼 "닫기"로 변경 */}
                <button
                  className="btn-apply"
                  onClick={closeModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="raon-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div
              className="raon-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="raon-modal-title">이력서를 삭제하시겠어요?</h3>
              <p className="raon-modal-message">
                삭제된 이력서는 복구할 수 없습니다.
              </p>
              <div className="raon-modal-actions">
                <button
                  className="raon-modal-btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  취소
                </button>
                <button
                  className="raon-modal-btn"
                  onClick={confirmDelete}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ 기본 이력서 설정 확인 모달 */}
        {showSetDefaultModal && (
          <div className="raon-modal-overlay" onClick={() => setShowSetDefaultModal(false)}>
            <div
              className="raon-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="raon-modal-title">기본 이력서로 설정하시겠어요?</h3>
              <p className="raon-modal-message">
                이 이력서가 기본 이력서로 설정되며, 기존 기본 이력서는 해제됩니다.
              </p>
              <div className="raon-modal-actions">
                <button
                  className="raon-modal-btn-secondary"
                  onClick={() => setShowSetDefaultModal(false)}
                >
                  취소
                </button>
                <button
                  className="raon-modal-btn"
                  onClick={confirmSetDefault}
                >
                  설정하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="resume-management">
      {currentPage === 'form' && renderFormPage()}
      {currentPage === 'list' && renderListPage()}
    </div>
  );
};

export default RaonResume;
