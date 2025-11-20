import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TopBar.css";

export default function TopBar({ isLoggedIn = false, user = null, onLogout = () => {} }) {
  const navigate = useNavigate();
  const displayName =
    (user?.nickname && user.nickname.trim()) ||
    user?.name ||
    user?.email ||
    "사용자";

  return (
    <header className="top-bar">
      <div className="top-bar-container">
        <div className="top-bar-content">
          {/* 왼쪽: 로고 */}
          <div className="top-bar-left">
            <Link to="/" className="logo-link">
              <div className="logo-icon">R</div>
              <h1 className="logo-text">RAON</h1>
            </Link>
          </div>

          {/* 중앙: 메뉴 */}
          <nav className="top-bar-center">
            <button 
              onClick={() => navigate("/")} 
              className="nav-button"
            >
              홈
            </button>
            <button 
              onClick={() => navigate("/avatar")} 
              className="nav-button"
            >
              면접 연습
            </button>
            <button 
              onClick={() => navigate("/document-review")} 
              className="nav-button"
            >
              서류 첨삭
            </button>
            <button 
              onClick={() => navigate("/history")} 
              className="nav-button"
            >
              학습 기록
            </button>
          </nav>

          {/* 오른쪽: 사용자 정보 */}
          <div className="top-bar-right">
            {isLoggedIn ? (
              <div className="user-section">
                <button
                  onClick={() => navigate("/account")}
                  className="user-name-button"
                  title="회원정보 수정"
                >
                  {displayName}님
                </button>
                <button
                  onClick={onLogout}
                  className="logout-button"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-button">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}