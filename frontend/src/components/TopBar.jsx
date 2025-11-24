// src/components/TopBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ isLoggedIn, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로 확인 함수
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="topbar">
      <div className="topbar-container">
        {/* 로고 */}
        <div className="topbar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">R</div>
          <span className="logo-text">RAON</span>
        </div>

        {/* 중앙 메뉴 */}
        <nav className="topbar-nav">
          <button
            onClick={() => navigate('/')}
            className={isActive('/') && !isActive('/avatar') && !isActive('/resume') && !isActive('/chatlist') ? 'active' : ''}
          >
            홈
          </button>
          <button
            onClick={() => navigate('/avatar')}
            className={isActive('/avatar') ? 'active' : ''}
          >
            면접 연습
          </button>
          <button
            onClick={() => navigate('/resume')}
            className={isActive('/resume') ? 'active' : ''}
          >
            이력서/자소서
          </button>
          <button
            onClick={() => navigate('/Dashboard')}
            className={isActive('/Dashboard') ? 'active' : ''}
          >
            학습 기록
          </button>
        </nav>

        {/* 우측 사용자 메뉴 */}
        <div className="topbar-user">
          {isLoggedIn && user ? (
            <>
              <button className="btn-account" onClick={() => navigate('/account')}>
                {user.nickname || user.name}님
              </button>
              <button className="btn-logout" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={() => navigate('/login')}>
              로그인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;