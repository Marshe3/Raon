import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import './RaonResume.css';

/**
 * 이력서 관리 페이지
 */
function RaonResume() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingResume, setEditingResume] = useState(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    phone: '',
    email: '',
    desiredPosition: '',
    skills: '',
    coverLetter: '', // 자소서 추가
    isDefault: false,
    educations: [],
    careers: []
  });

  // 이력서 목록 조회
  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/raon/api/resumes', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('이력서 조회 실패:', error);
    }
  };

  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 학력 추가
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [...prev.educations, {
        educationType: '',
        schoolName: '',
        major: '',
        startDate: '',
        endDate: '',
        attendancePeriod: '',
        status: '',
        gpa: '',
        orderIndex: prev.educations.length
      }]
    }));
  };

  // 학력 삭제
  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  // Date 객체를 YYYY.MM 형식으로 변환
  const formatDateToYearMonth = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
  };

  // 학력 변경
  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const updatedEducations = prev.educations.map((edu, i) => {
        if (i !== index) return edu;

        const updated = { ...edu, [field]: value };

        // 날짜 필드가 변경되면 attendancePeriod 자동 생성
        if (field === 'startDate' || field === 'endDate') {
          const start = field === 'startDate' ? value : edu.startDate;
          const end = field === 'endDate' ? value : edu.endDate;

          if (start && end) {
            updated.attendancePeriod = `${formatDateToYearMonth(start)} ~ ${formatDateToYearMonth(end)}`;
          } else if (start) {
            updated.attendancePeriod = `${formatDateToYearMonth(start)} ~`;
          }
        }

        return updated;
      });

      return { ...prev, educations: updatedEducations };
    });
  };

  // 경력 추가
  const handleAddCareer = () => {
    setFormData(prev => ({
      ...prev,
      careers: [...prev.careers, {
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        employmentPeriod: '',
        isCurrent: false,
        responsibilities: '',
        achievements: '',
        orderIndex: prev.careers.length
      }]
    }));
  };

  // 경력 삭제
  const handleRemoveCareer = (index) => {
    setFormData(prev => ({
      ...prev,
      careers: prev.careers.filter((_, i) => i !== index)
    }));
  };

  // 경력 변경
  const handleCareerChange = (index, field, value) => {
    setFormData(prev => {
      const updatedCareers = prev.careers.map((career, i) => {
        if (i !== index) return career;

        const updated = { ...career, [field]: value };

        // 현재 재직중 체크 시 endDate 초기화
        if (field === 'isCurrent' && value === true) {
          updated.endDate = '';
          if (updated.startDate) {
            updated.employmentPeriod = `${formatDateToYearMonth(updated.startDate)} ~ 현재`;
          }
        }

        // 날짜 필드가 변경되면 employmentPeriod 자동 생성
        if (field === 'startDate' || field === 'endDate') {
          const start = field === 'startDate' ? value : career.startDate;
          const end = field === 'endDate' ? value : career.endDate;

          if (career.isCurrent && start) {
            updated.employmentPeriod = `${formatDateToYearMonth(start)} ~ 현재`;
          } else if (start && end) {
            updated.employmentPeriod = `${formatDateToYearMonth(start)} ~ ${formatDateToYearMonth(end)}`;
          } else if (start) {
            updated.employmentPeriod = `${formatDateToYearMonth(start)} ~`;
          }
        }

        return updated;
      });

      return { ...prev, careers: updatedCareers };
    });
  };

  // 이력서 생성
  const handleCreate = () => {
    setEditingResume(null);
    setFormData({
      title: '',
      name: '',
      phone: '',
      email: '',
      desiredPosition: '',
      skills: '',
      coverLetter: '',
      isDefault: false,
      educations: [],
      careers: []
    });
    setShowForm(true);
  };

  // 이력서 수정
  const handleEdit = (resume) => {
    setEditingResume(resume);
    setFormData({
      title: resume.title || '',
      name: resume.name || '',
      phone: resume.phone || '',
      email: resume.email || '',
      desiredPosition: resume.desiredPosition || '',
      skills: resume.skills || '',
      coverLetter: resume.coverLetter || '',
      isDefault: resume.isDefault || false,
      educations: resume.educations || [],
      careers: resume.careers || []
    });
    setShowForm(true);
  };

  // 이력서 저장
  const handleSave = async () => {
    try {
      const url = editingResume
        ? `/raon/api/resumes/${editingResume.id}`
        : '/raon/api/resumes';

      const method = editingResume ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingResume ? '이력서가 수정되었습니다.' : '이력서가 생성되었습니다.');
        setShowForm(false);
        fetchResumes();
      } else {
        const error = await response.text();
        alert('저장 실패: ' + error);
      }
    } catch (error) {
      console.error('이력서 저장 실패:', error);
      alert('저장 실패');
    }
  };

  // 이력서 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/raon/api/resumes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('삭제되었습니다.');
        fetchResumes();
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      console.error('이력서 삭제 실패:', error);
      alert('삭제 실패');
    }
  };

  // 기본 이력서로 설정
  const handleSetDefault = async (id) => {
    try {
      const response = await fetch(`/raon/api/resumes/${id}/default`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('기본 이력서로 설정되었습니다.');
        fetchResumes();
      } else {
        alert('설정 실패');
      }
    } catch (error) {
      console.error('기본 이력서 설정 실패:', error);
      alert('설정 실패');
    }
  };

  return (
    <div className="resume-container">
      <div className="resume-header">
        <h1>이력서 관리</h1>
        <button onClick={() => navigate('/')} className="btn-back">홈으로</button>
      </div>

      {!showForm ? (
        <div className="resume-list">
          <div className="resume-actions">
            <button onClick={handleCreate} className="btn-create">
              새 이력서 작성 ({resumes.length}/5)
            </button>
          </div>

          {resumes.length === 0 ? (
            <p className="no-data">작성된 이력서가 없습니다.</p>
          ) : (
            <div className="resume-cards">
              {resumes.map(resume => (
                <div key={resume.id} className={`resume-card ${resume.isDefault ? 'default' : ''}`}>
                  <div className="card-header">
                    <h3>{resume.title}</h3>
                    {resume.isDefault && <span className="badge-default">기본</span>}
                  </div>
                  <div className="card-body">
                    <p><strong>이름:</strong> {resume.name}</p>
                    <p><strong>희망직무:</strong> {resume.desiredPosition}</p>
                    <p><strong>연락처:</strong> {resume.phone}</p>
                    <p><strong>이메일:</strong> {resume.email}</p>
                    {resume.skills && <p><strong>기술/역량:</strong> {resume.skills}</p>}
                    {resume.educations && resume.educations.length > 0 && (
                      <p><strong>학력:</strong> {resume.educations.length}개</p>
                    )}
                    {resume.careers && resume.careers.length > 0 && (
                      <p><strong>경력:</strong> {resume.careers.length}개</p>
                    )}
                  </div>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(resume)} className="btn-edit">수정</button>
                    <button onClick={() => handleDelete(resume.id)} className="btn-delete">삭제</button>
                    {!resume.isDefault && (
                      <button onClick={() => handleSetDefault(resume.id)} className="btn-default">
                        기본으로 설정
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="resume-form">
          <h2>{editingResume ? '이력서 수정' : '새 이력서 작성'}</h2>

          {/* 기본 정보 */}
          <div className="form-section">
            <h3>기본 정보</h3>

            <div className="form-group">
              <label>제목 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="예: 네이버 지원용"
                required
              />
            </div>

            <div className="form-group">
              <label>이름 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>연락처</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
              />
            </div>

            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>희망 직무</label>
              <input
                type="text"
                name="desiredPosition"
                value={formData.desiredPosition}
                onChange={handleInputChange}
                placeholder="예: 백엔드 개발자"
              />
            </div>

            <div className="form-group">
              <label>기술/역량</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="예: Java, Spring Boot, MySQL, Git"
                rows="3"
              />
            </div>
          </div>

          {/* 학력 */}
          <div className="form-section">
            <div className="section-header">
              <h3>학력</h3>
              <button type="button" onClick={handleAddEducation} className="btn-add">+ 추가</button>
            </div>

            {formData.educations.map((edu, index) => (
              <div key={index} className="item-box">
                <div className="item-header">
                  <span>학력 {index + 1}</span>
                  <button type="button" onClick={() => handleRemoveEducation(index)} className="btn-remove">삭제</button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>학력 구분</label>
                    <select
                      value={edu.educationType}
                      onChange={(e) => handleEducationChange(index, 'educationType', e.target.value)}
                    >
                      <option value="">선택</option>
                      <option value="고등학교">고등학교</option>
                      <option value="대학교(학사)">대학교(학사)</option>
                      <option value="대학원(석사)">대학원(석사)</option>
                      <option value="대학원(박사)">대학원(박사)</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>학교명</label>
                    <input
                      type="text"
                      value={edu.schoolName}
                      onChange={(e) => handleEducationChange(index, 'schoolName', e.target.value)}
                      placeholder="예: 한국대학교"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>전공</label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                      placeholder="고졸인 경우 비워두셔도 됩니다"
                    />
                  </div>

                  <div className="form-group">
                    <label>시작일</label>
                    <DatePicker
                      selected={edu.startDate}
                      onChange={(date) => handleEducationChange(index, 'startDate', date)}
                      dateFormat="yyyy.MM"
                      showMonthYearPicker
                      locale={ko}
                      placeholderText="시작일 선택"
                      className="date-picker-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>종료일</label>
                    <DatePicker
                      selected={edu.endDate}
                      onChange={(date) => handleEducationChange(index, 'endDate', date)}
                      dateFormat="yyyy.MM"
                      showMonthYearPicker
                      locale={ko}
                      placeholderText="종료일 선택"
                      minDate={edu.startDate}
                      className="date-picker-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>재학기간 (자동생성)</label>
                    <input
                      type="text"
                      value={edu.attendancePeriod}
                      readOnly
                      placeholder="시작일과 종료일을 선택하세요"
                      className="readonly-field"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>상태</label>
                    <select
                      value={edu.status}
                      onChange={(e) => handleEducationChange(index, 'status', e.target.value)}
                    >
                      <option value="">선택</option>
                      <option value="졸업">졸업</option>
                      <option value="재학중">재학중</option>
                      <option value="중퇴">중퇴</option>
                      <option value="수료">수료</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>학점 (선택)</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                      placeholder="예: 4.0/4.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 경력 */}
          <div className="form-section">
            <div className="section-header">
              <h3>경력</h3>
              <button type="button" onClick={handleAddCareer} className="btn-add">+ 추가</button>
            </div>

            {formData.careers.map((career, index) => (
              <div key={index} className="item-box">
                <div className="item-header">
                  <span>경력 {index + 1}</span>
                  <button type="button" onClick={() => handleRemoveCareer(index)} className="btn-remove">삭제</button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>회사명</label>
                    <input
                      type="text"
                      value={career.companyName}
                      onChange={(e) => handleCareerChange(index, 'companyName', e.target.value)}
                      placeholder="예: (주)테크컴퍼니"
                    />
                  </div>

                  <div className="form-group">
                    <label>직무/직책</label>
                    <input
                      type="text"
                      value={career.position}
                      onChange={(e) => handleCareerChange(index, 'position', e.target.value)}
                      placeholder="예: 백엔드 개발자"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>시작일</label>
                    <DatePicker
                      selected={career.startDate}
                      onChange={(date) => handleCareerChange(index, 'startDate', date)}
                      dateFormat="yyyy.MM"
                      showMonthYearPicker
                      locale={ko}
                      placeholderText="시작일 선택"
                      className="date-picker-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>종료일</label>
                    <DatePicker
                      selected={career.endDate}
                      onChange={(date) => handleCareerChange(index, 'endDate', date)}
                      dateFormat="yyyy.MM"
                      showMonthYearPicker
                      locale={ko}
                      placeholderText="종료일 선택"
                      minDate={career.startDate}
                      disabled={career.isCurrent}
                      className="date-picker-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>근무기간 (자동생성)</label>
                    <input
                      type="text"
                      value={career.employmentPeriod}
                      readOnly
                      placeholder="시작일과 종료일을 선택하세요"
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={career.isCurrent}
                        onChange={(e) => handleCareerChange(index, 'isCurrent', e.target.checked)}
                      />
                      현재 재직중
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>담당업무</label>
                  <textarea
                    value={career.responsibilities}
                    onChange={(e) => handleCareerChange(index, 'responsibilities', e.target.value)}
                    placeholder="담당했던 업무를 자유롭게 작성해주세요"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>성과 (선택)</label>
                  <textarea
                    value={career.achievements}
                    onChange={(e) => handleCareerChange(index, 'achievements', e.target.value)}
                    placeholder="업무 성과를 자유롭게 작성해주세요"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 자소서 */}
          <div className="form-section">
            <h3>자기소개서</h3>
            <div className="form-group">
              <label>자소서 내용</label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                placeholder="자기소개서를 자유롭게 작성해주세요. 지원동기, 성장과정, 강점, 입사 후 포부 등을 포함할 수 있습니다."
                rows="10"
              />
            </div>
          </div>

          {/* 기본 설정 */}
          <div className="form-group-checkbox">
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
              />
              기본 이력서로 설정 (면접 챗봇이 이 이력서를 참고합니다)
            </label>
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="btn-save">저장</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaonResume;
