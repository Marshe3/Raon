import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TopBar({ isLoggedIn = false, user = null, onLogout = () => {} }) {
  const navigate = useNavigate();

  const displayName =
    (user?.nickname && user.nickname.trim()) ||
    user?.name ||
    user?.email ||
    "사용자";

  return (
    <header className="sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="mt-2 rounded-t-2xl bg-[#9C86F7] text-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 sm:px-4">
            <Link
              to="/"
              aria-label="홈으로"
              className="font-bold tracking-tight rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              RAON
            </Link>

            <nav className="flex items-center gap-4 text-[13px] sm:text-sm">
              <button onClick={() => navigate("/avatar")} className="rounded px-1.5 py-1 hover:bg-white/15">아바타</button>
              <button onClick={() => navigate("/chatlist")} className="rounded px-1.5 py-1 hover:bg-white/15">채팅방</button>
              <button onClick={() => navigate("/summary")} className="rounded px-1.5 py-1 hover:bg-white/15">요약</button>
              <button onClick={() => navigate("/note")} className="rounded px-1.5 py-1 hover:bg-white/15">노트</button>
              <button onClick={() => navigate("/menu")} className="rounded px-1.5 py-1 hover:bg-white/15">메뉴</button>

              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {/* 🔽 이름(또는 닉네임)을 누르면 /account 이동 */}
                  <button
                    onClick={() => navigate("/account")}
                    title="회원정보 수정"
                    className="rounded px-2 py-1 bg-white/0 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    {displayName}님
                  </button>
                  <button
                    onClick={onLogout}
                    className="rounded px-2 py-1 bg-white/20 hover:bg白/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded px-2 py-1 bg-white/20 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  로그인
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
