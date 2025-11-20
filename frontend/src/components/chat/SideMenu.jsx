import React from 'react';

/**
 * 사이드 메뉴 컴포넌트
 */
const SideMenu = ({ isOpen, onClose, isSessionActive, onEndSession }) => {
  if (!isOpen) return null;

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
              세션 종료
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
