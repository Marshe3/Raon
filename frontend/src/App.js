// src/App.js
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import RaonHome from "./components/RaonHome.jsx";
import RaonSocialLogin from "./components/RaonSocialLogin.jsx";
import PersoLiveChat from "./components/PersoLiveChat/PersoLiveChat.jsx";
import RaonChatList from "./components/RaonChatList.jsx";
import RaonAvatar from "./components/RaonAvatar.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

function AppInner() {
  const navigate = useNavigate();

  const chats = [
    { id: "c1", title: "친구 아바타와의 대화", lastMessage: "마지막: 오늘 기분이 어때?", updatedAt: "마지막 기록: 2시간 전" },
  ];

  const onKakao = () => {
    window.Kakao?.Auth?.authorize({ redirectUri: `${window.location.origin}/login/oauth2/code/kakao` });
  };
  const onGoogle = () => { window.location.href = "/oauth2/authorization/google"; };

  const handleOpenChat = (id) => navigate(`/chat/${id}`);

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
          />
        }
      />
      <Route path="/login" element={<RaonSocialLogin onKakao={onKakao} onGoogle={onGoogle} />} />
      <Route path="/chatrooms" element={<RaonChatList />} />
      <Route path="/avatar" element={<RaonAvatar />} />
      <Route path="/chat/:chatId" element={<PersoLiveChat />} />
      <Route path="/chat" element={<PersoLiveChat />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
