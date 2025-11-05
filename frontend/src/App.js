// src/App.js
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RaonHome from "./components/RaonHome.jsx";
import RaonSocialLogin from "./components/RaonSocialLogin.jsx";
import PersoLiveChat from "./components/PersoLiveChat/PersoLiveChat.jsx"; // ← 폴더 경로 주의!

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

// BrowserRouter 안쪽에서 useNavigate를 쓰기 위한 내부 컴포넌트
function AppInner() {
  const navigate = useNavigate();

  // 로그인 상태 관리를 위한 state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 상태
  const [user, setUser] = useState(null); // 사용자 정보 상태

  // 컴포넌트가 마운트될 때 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();

    // 페이지가 포커스를 받을 때마다 로그인 상태 확인 (OAuth2 리다이렉트 후 감지)
    const handleFocus = () => {
      console.log('페이지 포커스 감지 - 로그인 상태 재확인');
      setTimeout(() => checkLoginStatus(), 100); // 약간의 지연 후 확인
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 서버에서 현재 로그인 상태를 확인하는 함수
  const checkLoginStatus = async () => {
    try {
      console.log('로그인 상태 확인 시작...');
      // 쿠키 기반 인증으로 사용자 정보 요청 (context-path 포함)
      const response = await fetch('/raon/api/user/me', {
        credentials: 'include' // 쿠키 포함하여 요청
      });

      console.log('API 응답 상태:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('로그인된 사용자 정보:', userData);
        setUser(userData); // 사용자 정보 저장
        setIsLoggedIn(true); // 로그인 상태로 변경
      } else {
        console.log('로그인되지 않음 - 상태코드:', response.status);
      }
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청 (context-path 포함)
      await fetch('/raon/logout', {
        method: 'POST',
        credentials: 'include' // 쿠키 포함하여 요청
      });
      // 클라이언트 상태 초기화
      setIsLoggedIn(false); // 로그아웃 상태로 변경
      setUser(null); // 사용자 정보 초기화
      navigate('/'); // 홈페이지로 이동
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const chats = [
    { id: "c1", title: "친구 아바타와의 대화", lastMessage: "마지막: 오늘 기분이 어때?", updatedAt: "마지막 기록: 2시간 전" },
  ];

  // OAuth2 로그인은 RaonSocialLogin 컴포넌트에서 직접 처리

  // ✅ 리스트 아이템 클릭 시 해당 채팅 페이지로 이동
  const handleOpenChat = (id) => navigate(`/chat/${id}`);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RaonHome
            chats={chats}
            onNavigate={(tab) => navigate(`/${tab}`)}   // 원하면 각 탭 라우트로 연결
            onOpenChat={handleOpenChat}                // ← 여기 연결됨
            onSeeMore={() => navigate("/chat")}
            isLoggedIn={isLoggedIn}  // 로그인 상태를 자식 컴포넌트에 전달
            user={user}              // 사용자 정보를 자식 컴포넌트에 전달
            onLogout={handleLogout}  // 로그아웃 함수를 자식 컴포넌트에 전달
          />
        }
      />
      <Route path="/login" element={<RaonSocialLogin />} />

      {/* ✅ 채팅 상세(아이디 사용) */}
      <Route path="/chat/:chatId" element={<PersoLiveChat />} />

      {/* 선택: 채팅 목록(필요시) */}
      <Route path="/chat" element={<PersoLiveChat />} />

      {/* 기타 경로는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}