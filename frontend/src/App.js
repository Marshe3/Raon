import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RaonHome from "./components/RaonHome.jsx";
import RaonSocialLogin from "./components/RaonSocialLogin.jsx";
import RaonChatList from "./components/RaonChatList.jsx";
import RaonAvatar from "./components/RaonAvatar.jsx";
import ChatComponent from "./components/ChatComponent.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // 로그인 상태 확인
  const checkLoginStatus = async () => {
    try {
      console.log("로그인 상태 확인 시작...");
      const response = await fetch("/raon/api/user/me", { credentials: "include" });
      console.log("API 응답 상태:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("로그인된 사용자 정보:", userData);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        console.log("로그인되지 않음 - 상태코드:", response.status);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("로그인 상태 확인 오류:", error);
    }
  };

  // 마운트 및 포커스 시 로그인 상태 재확인
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
        console.log("페이지 포커스 감지 - 로그인 상태 재확인");
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
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/raon/logout", { method: "POST", credentials: "include" });
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 소셜 로그인 핸들러
  const onKakao = () => {
    window.Kakao?.Auth?.authorize({
      redirectUri: `${window.location.origin}/login/oauth2/code/kakao`,
    });
  };
  const onGoogle = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const handleOpenChat = (id) => navigate(`/chat/${id}`);

  const chats = [
    {
      id: "c1",
      title: "친구 아바타와의 대화",
      lastMessage: "마지막: 오늘 기분이 어때?",
      updatedAt: "마지막 기록: 2시간 전",
    },
  ];

  return (
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
      <Route path="/login" element={<RaonSocialLogin onKakao={onKakao} onGoogle={onGoogle} />} />
      <Route path="/chatrooms" element={<RaonChatList />} />
      <Route path="/chat/:id" element={<ChatComponent />} />
      <Route path="/avatar" element={<RaonAvatar />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}