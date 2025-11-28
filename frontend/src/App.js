// src/App.js
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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
import { fetchWithAuth } from "./utils/api";
import RaonDashboard from "./components/RaonDashboard.jsx";           // ⬅️ 상세 학습 기록 화면
import InterviewScorePage from "./components/InterviewScorePage.jsx"; // ⬅️ 점수 요약 + 버튼 화면 (추가)

// ✅ ScrollToTop 컴포넌트 추가
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return <AppInner />;
}

function AppInner() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const checkLoginStatus = useCallback(async () => {
    try {
      logger.log("로그인 상태 확인 시작...");
      const response = await fetchWithAuth("/raon/api/users/me");
      logger.log("API 응답 상태:", response.status);

      if (response.ok) {
        const userData = await response.json();
        logger.log("로그인된 사용자 정보:", userData);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        logger.warn("로그인 상태 확인 실패");
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (e) {
      logger.error("로그인 상태 확인 오류:", e);
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

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
      await fetchWithAuth("/raon/api/auth/logout", {
        method: "POST"
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
    window.location.href = "/raon/oauth2/authorization/kakao";
  };
  const onGoogle = () => {
    // CustomAuthorizationRequestResolver가 prompt=login 파라미터를 자동으로 추가
    window.location.href = "/raon/oauth2/authorization/google";
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
      
      {/* ✅ ScrollToTop 컴포넌트 추가 */}
      <ScrollToTop />

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

        <Route
          path="/login"
          element={<RaonSocialLogin onKakao={onKakao} onGoogle={onGoogle} />}
        />

        {/* RaonChatList 삭제 → 홈으로 */}
        <Route path="/chatrooms" element={<Navigate to="/" replace />} />
        <Route path="/chatlist" element={<Navigate to="/" replace />} />

        <Route
          path="/chat/:id"
          element={<RaonChatPerso user={user} isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/avatar"
          element={<RaonAvatar user={user} isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/backoffice"
          element={<RaonBackoffice user={user} isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/resume"
          element={
            isLoggedIn ? <RaonResume /> : <Navigate to="/login" replace />
          }
        />

        {/* ✅ 학습 기록(대시보드) - 이제 요약 화면(InterviewScorePage) 먼저 */}
        <Route
          path="/Dashboard"
          element={
            isLoggedIn
              ? <InterviewScorePage user={user} />
              : <Navigate to="/login" replace />
          }
        />

        {/* ✅ 추가: 레거시 경로 호환 */}
        <Route
          path="/history"
          element={<Navigate to="/Dashboard" replace />}
        />
		

        {/* 항상 마지막 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}
