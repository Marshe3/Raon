import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    isDefault: false,
    educations: [],
    careers: []
  });

  // 이력서 목록 조회
  useEffect(() => {
    fetchResumes();
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
        // 로그인 필요
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
              rows="4"
            />
          </div>

          <div className="form-group-checkbox">
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
              />
              기본 이력서로 설정
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
