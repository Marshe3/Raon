import React, { useState } from 'react';
import './RaonResume.css';

const RaonResume = () => {
    // 페이지: 리스트/작성폼만 사용 (empty 페이지 제거)
    const [currentPage, setCurrentPage] = useState('form'); // 'form', 'list'
    const [currentTab, setCurrentTab] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const totalTabs = 5;

    // 나중에 실제 이력서 데이터를 넣을 자리
    const [resumes, setResumes] = useState([]); // 지금은 빈 배열이라 카드 안 보임

    // 학력 날짜
    const [educationStartDate, setEducationStartDate] = useState('');
    const [educationEndDate, setEducationEndDate] = useState('');

    // 경력 날짜
    const [careerStartDate, setCareerStartDate] = useState('');
    const [careerEndDate, setCareerEndDate] = useState('');
    const [isCurrentJob, setIsCurrentJob] = useState(false);

    // 페이지 전환
    const navigateToForm = () => setCurrentPage('form');
    const navigateToList = () => setCurrentPage('list');

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

    // 모달 관리 (나중에 카드 생기면 사용)
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

    // 저장 버튼 (지금은 단순히 리스트 페이지로만 이동)
    const handleSaveResume = () => {
        // TODO: 나중에 실제 이력서 저장 로직 추가
        navigateToList();
        setCurrentTab(0);
    };

    const handleDeleteResume = () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            window.alert('삭제되었습니다');
            // TODO: 실제 삭제 로직 추가
        }
    };

    const handleApplyFeedback = () => {
        window.alert('첨삭 내용이 반영되었습니다!');
        closeModal();
    };

    // ==================== 이력서 작성 폼 페이지 ====================
    const renderFormPage = () => (
        <div className="resume-form-page">
            <div className="container">
                <div className="form-header">
                    <h1 className="form-title">새 이력서 작성</h1>
                    <p className="form-subtitle">필요한 정보를 입력해주세요. 필수 항목(*)은 반드시 입력해야 합니다.</p>
                </div>

                <div className="tabs-container">
                    <div className="tabs-nav">
                        <button className={`tab-btn ${currentTab === 0 ? 'active' : ''}`} onClick={() => switchTab(0)}>기본 정보</button>
                        <button className={`tab-btn ${currentTab === 1 ? 'active' : ''}`} onClick={() => switchTab(1)}>기술/역량</button>
                        <button className={`tab-btn ${currentTab === 2 ? 'active' : ''}`} onClick={() => switchTab(2)}>학력/경력</button>
                        <button className={`tab-btn ${currentTab === 3 ? 'active' : ''}`} onClick={() => switchTab(3)}>자기소개서</button>
                        <button className={`tab-btn ${currentTab === 4 ? 'active' : ''}`} onClick={() => switchTab(4)}>완료</button>
                    </div>

                    {/* 탭 1: 기본 정보 */}
                    <div className={`tab-content ${currentTab === 0 ? 'active' : ''}`}>
                        <div className="tab-header">
                            <h2 className="tab-title">기본 정보</h2>
                            <p className="tab-description">이력서의 기본이 되는 정보를 입력해주세요</p>
                        </div>

                        <div className="form-field">
                            <label className="field-label">
                                이력서 제목<span className="required-mark">*</span>
                            </label>
                            <input type="text" className="field-input" placeholder="예: 네이버 지원용" />
                        </div>

                        <div className="form-field">
                            <label className="field-label">
                                이름<span className="required-mark">*</span>
                            </label>
                            <input type="text" className="field-input" placeholder="홍길동" />
                        </div>

                        <div className="form-field">
                            <label className="field-label">연락처</label>
                            <input type="tel" className="field-input" placeholder="010-1234-5678" />
                        </div>

                        <div className="form-field">
                            <label className="field-label">이메일</label>
                            <input type="email" className="field-input" placeholder="example@email.com" />
                        </div>

                        <div className="form-field">
                            <label className="field-label">희망 직무</label>
                            <input type="text" className="field-input" placeholder="예: 백엔드 개발자" />
                        </div>
                    </div>

                    {/* 탭 2: 기술/역량 */}
                    <div className={`tab-content ${currentTab === 1 ? 'active' : ''}`}>
                        <div className="tab-header">
                            <h2 className="tab-title">기술/역량</h2>
                            <p className="tab-description">보유하고 계신 기술과 역량을 작성해주세요</p>
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
                                <p>사용 가능한 기술 스택, 프레임워크, 도구 등을 구체적으로 작성해주세요.</p>
                                <p>숙련도별로 구분하여 작성하면 더욱 좋습니다. 예를 들어, "상: Java, Spring", "중: Python, Django" 형태로 작성할 수 있습니다.</p>
                            </div>
                        </div>
                    </div>

                    {/* 탭 3: 학력/경력 */}
                    <div className={`tab-content ${currentTab === 2 ? 'active' : ''}`}>
                        <div className="tab-header">
                            <h2 className="tab-title">학력/경력</h2>
                            <p className="tab-description">학력 및 경력 사항을 입력해주세요</p>
                        </div>

                        {/* ===== 학력 섹션 ===== */}
                        <div className="section-title">학력</div>

                        {/* 1행: 학교명 / 전공 */}
                        <div className="form-row">
                            <div className="form-field">
                                <label className="field-label">학교명</label>
                                <input type="text" className="field-input" placeholder="예: 한국대학교" />
                            </div>
                            <div className="form-field">
                                <label className="field-label">전공</label>
                                <input type="text" className="field-input" placeholder="고졸인 경우 비워두셔도 됩니다" />
                            </div>
                        </div>

                        {/* 2행: 상태 / 학력 구분 */}
                        <div className="form-row">
                            <div className="form-field select-field">
                                <label className="field-label">상태</label>
                                <select className="field-select">
                                    <option>선택</option>
                                    <option>졸업</option>
                                    <option>재학 중</option>
                                    <option>휴학 중</option>
                                    <option>중퇴</option>
                                </select>
                            </div>
                            <div className="form-field select-field">
                                <label className="field-label">학력 구분</label>
                                <select className="field-select">
                                    <option>선택</option>
                                    <option>고등학교</option>
                                    <option>전문대학교</option>
                                    <option>대학교</option>
                                    <option>대학원</option>
                                </select>
                            </div>
                        </div>

                        {/* 3행: 시작일 / 종료일 */}
                        <div className="form-row">
                            <div className="form-field">
                                <label className="field-label">시작일</label>
                                <input 
                                    type="date" 
                                    className="field-input" 
                                    value={educationStartDate}
                                    onChange={(e) => setEducationStartDate(e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label className="field-label">종료일</label>
                                <input 
                                    type="date" 
                                    className="field-input" 
                                    value={educationEndDate}
                                    onChange={(e) => setEducationEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 4행: 재학기간 / 학점 */}
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
                                <input type="text" className="field-input" placeholder="예: 4.0/4.5" />
                            </div>
                        </div>

                        {/* ===== 경력 섹션 ===== */}
                        <div className="section-divider">
                            <div className="section-title">경력</div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label className="field-label">회사명</label>
                                <input type="text" className="field-input" placeholder="예: (주)테크컴퍼니" />
                            </div>
                            <div className="form-field">
                                <label className="field-label">직무/직책</label>
                                <input type="text" className="field-input" placeholder="예: 백엔드 개발자" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label className="field-label">시작일</label>
                                <input 
                                    type="date" 
                                    className="field-input" 
                                    value={careerStartDate}
                                    onChange={(e) => setCareerStartDate(e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label className="field-label">종료일</label>
                                <input 
                                    type="date" 
                                    className="field-input" 
                                    value={careerEndDate}
                                    onChange={(e) => setCareerEndDate(e.target.value)}
                                    disabled={isCurrentJob}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="field-label">근무기간 (자동생성)</label>
                            <input 
                                type="text" 
                                className="field-input field-auto" 
                                value={isCurrentJob ? 
                                    (careerStartDate ? calculatePeriod(careerStartDate, new Date().toISOString().split('T')[0]) + ' (재직중)' : '') 
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
                                <label htmlFor="currentJob" className="checkbox-label-small">현재 재직중</label>
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="field-label">담당업무</label>
                            <textarea className="field-textarea" placeholder="담당했던 업무를 자유롭게 작성해주세요" rows="4"></textarea>
                        </div>

                        <div className="form-field">
                            <label className="field-label">성과 (선택)</label>
                            <textarea className="field-textarea" placeholder="업무 성과를 자유롭게 작성해주세요" rows="4"></textarea>
                        </div>
                    </div>

                    {/* 탭 4: 자기소개서 */}
                    <div className={`tab-content ${currentTab === 3 ? 'active' : ''}`}>
                        <div className="tab-header">
                            <h2 className="tab-title">자기소개서</h2>
                            <p className="tab-description">지원 동기와 포부를 자유롭게 작성해주세요</p>
                        </div>

                        <div className="form-field">
                            <textarea 
                                className="field-textarea" 
                                placeholder="지원 동기, 성장 과정, 강점, 입사 후 포부 등을 자유롭게 작성해주세요." 
                                rows="15"
                            ></textarea>
                        </div>

                        <div className="tip-box">
                            <div className="tip-title">✨ AI 첨삭 안내</div>
                            <div className="tip-text">
                                이력서를 저장하면 작성하신 자기소개서에 대한 AI 첨삭을 받을 수 있습니다. 구체적인 개선 방안과 추천 수정안을 제공해드립니다.
                            </div>
                        </div>
                    </div>

                    {/* 탭 5: 완료 */}
                    <div className={`tab-content ${currentTab === 4 ? 'active' : ''}`}>
                        <div className="completion-container">
                            <div className="completion-icon">🎉</div>
                            <h2 className="completion-title">작성 완료!</h2>
                            <p className="completion-text">이력서 작성이 거의 완료되었습니다</p>

                            <div className="checkbox-box">
                                <div className="checkbox-container">
                                    <input type="checkbox" className="checkbox-input" id="defaultResume" />
                                    <label htmlFor="defaultResume" className="checkbox-label">이 이력서를 기본 이력서로 설정</label>
                                </div>
                                <p className="checkbox-desc">AI 면접 연습 시 이 이력서를 참고합니다</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="action-bar" style={{ border: '1px solid #e2e8f0' }}>
                    <div className="button-left">
                        <button 
                            className="btn btn-cancel" 
                            onClick={navigateToList}
                            style={{
                                background: '#fee',
                                color: '#dc3545',
                                border: '1px solid #fcc',
                                opacity: '1',
                                visibility: 'visible'
                            }}
                        >
                            취소
                        </button>
                    </div>
                    <div className="button-right" style={{ opacity: '1', visibility: 'visible' }}>
                        {currentTab > 0 && (
                            <button 
                                className="btn btn-prev" 
                                onClick={prevTab}
                                style={{
                                    opacity: '1',
                                    visibility: 'visible'
                                }}
                            >
                                이전
                            </button>
                        )}
                        {currentTab < totalTabs - 1 && (
                            <button 
                                className="btn btn-next" 
                                onClick={nextTab}
                                style={{
                                    opacity: '1',
                                    visibility: 'visible',
                                    display: 'inline-block'
                                }}
                            >
                                다음
                            </button>
                        )}
                        {currentTab === totalTabs - 1 && (
                            <button 
                                className="btn btn-save" 
                                onClick={handleSaveResume}
                                style={{
                                    opacity: '1',
                                    visibility: 'visible'
                                }}
                            >
                                저장하기
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // ==================== 이력서 목록 페이지 ====================
    const renderListPage = () => (
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

                {/* 상단 통계 카드 (항상 표시, 지금은 0으로 고정) */}
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-number">0</div>
                        <div className="stat-label">작성된 이력서</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">0</div>
                        <div className="stat-label">기본 이력서</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">0</div>
                        <div className="stat-label">AI 첨삭 이력서</div>
                    </div>
                </div>

                {/* 이력서가 하나도 없을 때 */}
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
                        {/* 예시 카드 렌더링 자리 */}
                    </div>
                )}
            </div>

            {/* 첨삭 모달 */}
            <div 
                className={`modal-overlay ${isModalOpen ? 'active' : ''}`} 
                onClick={closeModal}
            >
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">AI 자소서 첨삭</h2>
                        <button className="btn-close" onClick={closeModal}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="original-section">
                            <span className="section-label">📝 작성한 자소서</span>
                            <div className="original-text">
                                저는 컴퓨터공학을 전공하며 웹 개발에 대한 열정을 키워왔습니다. 특히 사용자 경험을 개선하는 것에 큰 관심이 있으며, 프로젝트를 통해 React와 Spring Boot를 활용한 풀스택 개발 경험을 쌓았습니다.
                                <br /><br />
                                팀 프로젝트에서 리더로서 팀원들과 소통하며 목표를 달성한 경험이 있으며, 이를 통해 협업의 중요성을 배웠습니다. 앞으로도 지속적으로 학습하며 성장하는 개발자가 되고 싶습니다.
                            </div>
                        </div>

                        <div className="feedback-container">
                            <h3 className="feedback-title">🤖 AI 첨삭 결과</h3>
                            
                            <div className="feedback-block">
                                <div className="feedback-subtitle">👍 좋은 점</div>
                                <ul className="feedback-list">
                                    <li>본인의 전공과 관심사가 명확하게 드러나 있습니다.</li>
                                    <li>팀 프로젝트 경험을 통한 협업 능력을 언급한 것이 좋습니다.</li>
                                </ul>
                            </div>

                            <div className="feedback-block">
                                <div className="feedback-subtitle">💡 개선 제안</div>
                                <ul className="feedback-list">
                                    <li>구체적인 프로젝트 성과나 수치를 추가하면 더 설득력이 있을 것입니다.</li>
                                    <li>"사용자 경험 개선"에 대한 구체적인 사례를 추가해보세요.</li>
                                    <li>마지막 문단에 회사에 대한 관심과 기여 방안을 추가하면 좋습니다.</li>
                                </ul>
                            </div>

                            <div className="feedback-block">
                                <div className="feedback-subtitle">✍️ 추천 수정안</div>
                                <div className="suggestion-box">
                                    "저는 4년간 컴퓨터공학을 전공하며 사용자 중심의 웹 개발 역량을 키워왔습니다. 
                                    특히 '입양하냥 키워주개' 프로젝트에서 프론트엔드 개발을 담당하며 
                                    사용자 경험을 15% 개선한 경험이 있습니다..."
                                </div>
                            </div>

                            <button className="btn-apply" onClick={handleApplyFeedback}>
                                이 첨삭 내용을 자소서에 반영하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ==================== 메인 렌더링 ====================
    return (
        <div className="resume-management">
            {currentPage === 'form' && renderFormPage()}
            {currentPage === 'list' && renderListPage()}
        </div>
    );
};

export default RaonResume;