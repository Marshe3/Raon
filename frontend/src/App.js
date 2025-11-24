// src/App.js
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import RaonHome from "./components/RaonHome.jsx";
import RaonSocialLogin from "./components/RaonSocialLogin.jsx";
// import RaonChatList from "./components/RaonChatList.jsx";
import RaonAvatar from "./components/RaonAvatar.jsx";
import RaonBackoffice from "./components/RaonBackoffice.jsx";
import AccountEdit from "./components/AccountEdit.jsx";
import TopBar from "./components/TopBar.jsx";
import Footer from "./components/Footer.jsx";
import RaonChatPerso from "./components/RaonChatPerso.jsx";
import RaonResume from "./components/RaonResume.jsx";
import { logger } from "./utils/logger";
import RaonDashboard from "./components/RaonDashboard.jsx";

export default function App() {
  return <AppInner />;
}

function AppInner() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

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
        logger.log("Access Token 만료 - 갱신 시도");
        const refreshed = await refreshAccessToken();

        if (refreshed) {
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
      if (focusTimeout) clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        logger.log("페이지 포커스 감지 - 로그인 상태 재확인");
        checkLoginStatus();
      }, 5000);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      if (focusTimeout) clearTimeout(focusTimeout);
    };
  }, [checkLoginStatus]);

  const handleLogout = async () => {
    try {
      await fetch("/raon/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      setIsLoggedIn(false);
      setUser(null);

      sessionStorage.removeItem('raon_chat_messages');
      sessionStorage.removeItem('raon_sdk_config');
      sessionStorage.removeItem('raon_session_id');
      logger.log('🗑️ Logout: Chat history, SDK config, and session ID cleared');

      window.location.href = "/";
    } catch (e) {
      logger.error("Logout failed:", e);
      sessionStorage.removeItem('raon_chat_messages');
      sessionStorage.removeItem('raon_sdk_config');
      sessionStorage.removeItem('raon_session_id');
      window.location.href = "/";
    }
  };

  const onKakao = () => {
    window.Kakao?.Auth?.authorize({
      redirectUri: `${window.location.origin}/login/oauth2/code/kakao`,
      prompt: 'login',
    });
  };
  const onGoogle = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const handleOpenChat = (id) => {
    logger.log('Opening chat with chatbot ID:', id);
    navigate(`/chat/${id}`);
  };

  const chats = [
    { id: 1, title: "기본 챗봇", lastMessage: "PersoAI 기본 챗봇과 대화하기", updatedAt: "지금 시작하기" },
  ];

  return (
    <>
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
                  setUser((prev) => ({ ...(prev || {}), nickname: newNickname }));
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<RaonSocialLogin onKakao={onKakao} onGoogle={onGoogle} />} />

        {/* RaonChatList 삭제 → 홈으로 */}
        <Route path="/chatrooms" element={<Navigate to="/" replace />} />
        <Route path="/chatlist" element={<Navigate to="/" replace />} />

        <Route path="/chat/:id" element={<RaonChatPerso user={user} isLoggedIn={isLoggedIn} />} />
        <Route path="/avatar" element={<RaonAvatar user={user} isLoggedIn={isLoggedIn} />} />
        <Route path="/backoffice" element={<RaonBackoffice user={user} isLoggedIn={isLoggedIn} />} />
        <Route path="/resume" element={isLoggedIn ? <RaonResume /> : <Navigate to="/login" replace />} />

        {/* ✅ 학습 기록(대시보드) */}
        <Route path="/dashboard" element={<RaonDashboard />} />

        {/* ✅ 추가: 레거시 경로 호환 */}
        <Route path="/history" element={<Navigate to="/dashboard" replace />} />

        {/* 항상 마지막 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}
