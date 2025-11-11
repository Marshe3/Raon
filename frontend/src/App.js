// src/App.js
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RaonHome from "./components/RaonHome.jsx";
import RaonSocialLogin from "./components/RaonSocialLogin.jsx";
import RaonChatList from "./components/RaonChatList.jsx";
import RaonAvatar from "./components/RaonAvatar.jsx";
import RaonBackoffice from "./components/RaonBackoffice.jsx";
import DebugPage from "./components/DebugPage.jsx";
import AccountEdit from "./components/AccountEdit.jsx";
import TopBar from "./components/TopBar.jsx";

export default function App() {
  return <AppInner />;
}

function AppInner() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // 로그인 상태 확인
  const checkLoginStatus = async () => {
    try {
      const res = await fetch("/raon/api/users/me", { credentials: "include" });
      if (res.ok) {
        const me = await res.json();
        setUser(me);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.error("로그인 상태 확인 오류:", e);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    const onFocus = () => setTimeout(() => checkLoginStatus(), 100);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/raon/logout", { method: "POST", credentials: "include" });
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // 소셜 로그인
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
            />
          }
        />

        <Route
          path="/account"
          element={
            isLoggedIn ? (
              <AccountEdit
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
        <Route path="/avatar" element={<RaonAvatar />} />
        <Route path="/backoffice" element={<RaonBackoffice />} />
        <Route path="/debug" element={<DebugPage />} />

        {/* 항상 마지막 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
