import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 사이드 메뉴 컴포넌트
 */
const SideMenu = ({ isOpen, onClose, isSessionActive, onEndSession }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigateToResume = () => {
    onClose();
    navigate('/resume');
  };

  return (
    <>
      {/* 메뉴 오버레이 */}
      <div className="menu-overlay" onClick={onClose}></div>

      {/* 사이드 메뉴 */}
      <div className="side-menu">
        <div className="menu-header-side">
          <h3>설정</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="menu-section-side">
          <button
            onClick={handleNavigateToResume}
            style={{
              width: '100%',
              padding: '12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '10px'
            }}
          >
            📄 이력서 관리
          </button>
        </div>

        {isSessionActive && (
          <div className="menu-section-side">
            <button
              onClick={onEndSession}
              style={{
                width: '100%',
                padding: '12px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🎯 면접 종료
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
