// src/App.js
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import RaonHome from "./components/RaonHome.jsx";
import RaonSocialLogin from "./components/RaonSocialLogin.jsx";
import RaonChatList from "./components/RaonChatList.jsx";
import RaonAvatar from "./components/RaonAvatar.jsx";
import RaonBackoffice from "./components/RaonBackoffice.jsx";
import AccountEdit from "./components/AccountEdit.jsx";
import TopBar from "./components/TopBar.jsx";
import RaonChatPerso from "./components/RaonChatPerso.jsx";
import RaonResume from "./components/RaonResume.jsx";
import { logger } from "./utils/logger";

export default function App() {
  return <AppInner />;
}

function AppInner() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // 토큰 자동 갱신
  const refreshAccessToken = useCallback(async () => {
    try {
      logger.log("Access Token 갱신 시도...");
      const response = await fetch("/raon/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (response.ok) {
        logger.log("Access Token 갱신 성공");
        return true;
      } else {
        logger.log("Access Token 갱신 실패 - 로그아웃 처리");
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      logger.error("토큰 갱신 오류:", error);
      return false;
    }
  }, []);

  // 로그인 상태 확인
  const checkLoginStatus = useCallback(async () => {
    try {
      logger.log("로그인 상태 확인 시작...");
      const response = await fetch("/raon/api/users/me", {
        credentials: "include"
      });
      logger.log("API 응답 상태:", response.status);

      if (response.ok) {
        const userData = await response.json();
        logger.log("로그인된 사용자 정보:", userData);
        setUser(userData);
        setIsLoggedIn(true);
      } else if (response.status === 401) {
        // Access Token이 만료된 경우 자동 갱신 시도
        logger.log("Access Token 만료 - 갱신 시도");
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          // 갱신 성공 시 다시 사용자 정보 조회
          const retryResponse = await fetch("/raon/api/users/me", {
            credentials: "include"
          });
          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            setUser(userData);
            setIsLoggedIn(true);
          }
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (e) {
      logger.error("로그인 상태 확인 오류:", e);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    checkLoginStatus();

    let focusTimeout = null;
    const handleFocus = () => {
      // Debounce: 이전 타이머가 있으면 취소
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }

      // 5초 후에만 로그인 상태 확인 (과도한 API 호출 방지)
      focusTimeout = setTimeout(() => {
        logger.log("페이지 포커스 감지 - 로그인 상태 재확인");
        checkLoginStatus();
      }, 5000);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
    };
  }, [checkLoginStatus]);

  const handleLogout = async () => {
    try {
      await fetch("/raon/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      // 상태 초기화
      setIsLoggedIn(false);
      setUser(null);

      // 로그아웃 시 채팅 내역, SDK 설정, 세션 ID 삭제
      sessionStorage.removeItem('raon_chat_messages');
      sessionStorage.removeItem('raon_sdk_config');
      sessionStorage.removeItem('raon_session_id');
      logger.log('🗑️ Logout: Chat history, SDK config, and session ID cleared');

      // 로그아웃 후 페이지 새로고침하여 쿠키 삭제 확실히 반영
      window.location.href = "/";
    } catch (e) {
      logger.error("Logout failed:", e);
      // 에러가 발생해도 sessionStorage 삭제
      sessionStorage.removeItem('raon_chat_messages');
      sessionStorage.removeItem('raon_sdk_config');
      sessionStorage.removeItem('raon_session_id');
      // 에러가 발생해도 페이지 새로고침
      window.location.href = "/";
    }
  };

  // 소셜 로그인
  const onKakao = () => {
    window.Kakao?.Auth?.authorize({
      redirectUri: `${window.location.origin}/login/oauth2/code/kakao`,
      prompt: 'login', // 항상 로그인 화면 표시
    });
  };
  const onGoogle = () => {
    // CustomAuthorizationRequestResolver가 prompt=login 파라미터를 자동으로 추가
    window.location.href = "/oauth2/authorization/google";
  };

  const handleOpenChat = (id) => {
    logger.log('Opening chat with chatbot ID:', id);
    navigate(`/chat/${id}`);
  };

  const chats = [
    {
      id: 1, // 실제 chatbot_id (data.sql 참조)
      title: "기본 챗봇",
      lastMessage: "PersoAI 기본 챗봇과 대화하기",
      updatedAt: "지금 시작하기",
    },
  ];

  return (
    <>
      {/* 전역 네비게이션 */}
      <TopBar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />

      <Routes>
        <Route
          path="/"
          element={
            <RaonHome
              chats={chats}
              onNavigate={(tab) => navigate(`/${tab}`)}
              onOpenChat={handleOpenChat}
              onSeeMore={() => navigate("/chatrooms")}
              isLoggedIn={isLoggedIn}
              user={user}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/account"
          element={
            isLoggedIn ? (
              <AccountEdit
                user={user}
                isLoggedIn={isLoggedIn}
                onSaved={(newNickname) => {
                  // 닉네임 저장 직후 TopBar에 즉시 반영
                  setUser((prev) => ({ ...(prev || {}), nickname: newNickname }));
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<RaonSocialLogin onKakao={onKakao} onGoogle={onGoogle} />} />
        <Route path="/chatrooms" element={<RaonChatList />} />
        <Route path="/chatlist" element={<RaonChatList />} />
        <Route path="/chat/:id" element={<RaonChatPerso user={user} isLoggedIn={isLoggedIn} />} />
        <Route path="/avatar" element={<RaonAvatar user={user} isLoggedIn={isLoggedIn} />} />
        <Route path="/backoffice" element={<RaonBackoffice user={user} isLoggedIn={isLoggedIn} />} />
        <Route path="/resume" element={isLoggedIn ? <RaonResume /> : <Navigate to="/login" replace />} />

        {/* 항상 마지막 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
