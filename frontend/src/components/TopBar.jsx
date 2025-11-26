// src/components/TopBar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';

const TopBar = ({ isLoggedIn, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 라우트 경로 상수 (대소문자 경로를 쓰는 프로젝트라면 여기만 맞춰주세요)
  const PATHS = {
    home: '/',
    avatar: '/avatar',
    resume: '/resume',
    dashboard: '/dashboard', // 라우터가 '/Dashboard'라면 이 값만 '/Dashboard'로 바꾸세요
  };

  // 어떤 메뉴를 통해 이동했는지 기록 (login 페이지에서 사용)
  const [selectedMenu, setSelectedMenu] = useState(null);

  // 현재 경로 확인 함수 (대소문자 안전)
  const isActive = (path) => {
    const cur = location.pathname.toLowerCase();
    const target = path.toLowerCase();
    if (target === '/') return cur === '/';
    return cur.startsWith(target);
  };

  // ✅ 동일 메뉴를 다시 눌렀을 때 리프레시 효과
  const handleNavClick = (path, menu, needsAuth = false) => {
    setSelectedMenu(menu);

    // 보호 라우트라면 미로그인 시 /login으로
    if (needsAuth && !isLoggedIn) {
      navigate('/login');
      return;
    }

    // 같은 섹션 여부(대소문자 안전)
    const sameSection =
      path === '/'
        ? location.pathname === '/'
        : location.pathname.toLowerCase().startsWith(path.toLowerCase());

    if (sameSection) {
      // ✅ 쿼리스트링에 타임스탬프를 추가해서 리렌더링 유도
      const timestamp = Date.now();
      navigate(`${path}?refresh=${timestamp}`, { replace: true });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-container">
        {/* 로고 */}
        <div
          className="topbar-logo"
          onClick={() => handleNavClick(PATHS.home, 'home')}
        >
          <div className="logo-icon">R</div>
          <span className="logo-text">RAON</span>
        </div>

        {/* 중앙 메뉴 */}
        <nav className="topbar-nav">
          <button
            onClick={() => handleNavClick(PATHS.home, 'home')}
            className={
              isActive(PATHS.home) &&
              !isActive(PATHS.avatar) &&
              !isActive(PATHS.resume) &&
              !isActive('/chatlist')
                ? 'active'
                : ''
            }
          >
            홈
          </button>

          <button
            onClick={() => handleNavClick(PATHS.avatar, 'avatar')}
            className={isActive(PATHS.avatar) ? 'active' : ''}
          >
            면접 연습
          </button>

          {/* 이력서/자소서: 로그인 페이지(/login)에서 이 메뉴로 온 경우에도 active */}
          <button
            onClick={() => handleNavClick(PATHS.resume, 'resume', true)}
            className={
              isActive(PATHS.resume) ||
              (location.pathname === '/login' && selectedMenu === 'resume')
                ? 'active'
                : ''
            }
          >
            이력서/자소서
          </button>

          {/* 학습 기록 */}
          <button
            onClick={() => handleNavClick(PATHS.dashboard, 'dashboard', true)}
            className={
              isActive(PATHS.dashboard) ||
              (location.pathname === '/login' && selectedMenu === 'dashboard')
                ? 'active'
                : ''
            }
          >
            학습 기록
          </button>
        </nav>

        {/* 우측 사용자 메뉴 */}
        <div className="topbar-user">
          {isLoggedIn && user ? (
            <>
              <button
                className="btn-account"
                onClick={() => {
                  setSelectedMenu(null);
                  navigate('/account');
                }}
              >
                {user.nickname || user.name}님
              </button>
              <button className="btn-logout" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button
              className="btn-login"
              onClick={() => {
                // 로그인 버튼으로 간 로그인 화면은 메뉴 하이라이트 없음
                setSelectedMenu(null);
                navigate('/login');
              }}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;