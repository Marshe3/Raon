import { Link } from "react-router-dom";

// src/components/RaonHome.jsx
export default function RaonHome({
  chats = [],
  onNavigate = () => {},
  onOpenChat = () => {},
  onSeeMore = () => {},
  isLoggedIn = false,  // 로그인 상태 (부모 컴포넌트에서 전달)
  user = null,         // 사용자 정보 (부모 컴포넌트에서 전달)
  onLogout = () => {}, // 로그아웃 처리 함수 (부모 컴포넌트에서 전달)
}) {
  return (
    <div className="min-h-screen bg-[#EEF3FF]">
      {/* 상단 보라 네비 바 */}
      <header className="sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
          <div className="mt-2 rounded-t-2xl bg-[#9C86F7] text-white shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 sm:px-4">
              {/* 좌측 로고 → 홈으로 이동 */}
              <Link
                to="/"
                aria-label="홈으로"
                className="font-bold tracking-tight rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                RAON
              </Link>

              {/* 우측 메뉴 */}
              <nav className="flex items-center gap-4 text-[13px] sm:text-sm">
                <button
                  onClick={() => onNavigate("avatar")}
                  className="rounded px-1.5 py-1 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  아바타
                </button>
                <button
                  onClick={() => onNavigate("chat")}
                  className="rounded px-1.5 py-1 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  채팅방
                </button>
                <button
                  onClick={() => onNavigate("summary")}
                  className="rounded px-1.5 py-1 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  요약
                </button>
                <button
                  onClick={() => onNavigate("note")}
                  className="rounded px-1.5 py-1 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  노트
                </button>
                <button
                  onClick={() => onNavigate("menu")}
                  className="rounded px-1.5 py-1 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  메뉴
                </button>
				{/* 로그인/로그아웃 버튼 - 로그인 상태에 따라 조건부 렌더링 */}
	            {isLoggedIn ? (
	              // 로그인된 경우: 사용자명과 로그아웃 버튼 표시
	              <div className="flex items-center gap-2">
	                {user && (
	                  <span className="text-sm">
	                    {/* 사용자 이름, 이메일 순으로 표시하고 없으면 기본값 */}
	                    {user.name || user.email || '사용자'}님
	                  </span>
	                )}
	                <button
	                  onClick={onLogout} // 로그아웃 함수 호출
	                  className="rounded px-2 py-1 bg-white/20 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
	                >
	                  로그아웃
	                </button>
	              </div>
	            ) : (
	              // 로그인되지 않은 경우: 로그인 버튼 표시
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

      {/* 메인 */}
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-extrabold text-center">RAON</h1>
        <p className="text-sm text-center text-gray-700">
          AI 아바타와 함께하는 일상의 동반자
        </p>

        {/* 배너 자리 */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white/70 p-6 text-center">
          <div className="text-lg font-semibold text-gray-500">RAON</div>
          <div className="text-sm text-gray-400">로고 이미지</div>
          <div className="text-sm text-gray-400">배너</div>
        </div>

        {/* 채팅 리스트 */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">내 채팅방</h2>
            <button
              onClick={onSeeMore}
              className="text-sm px-2 py-1 rounded hover:text-gray-900"
            >
              + 더 보기
            </button>
          </div>
          <ul className="mt-3 space-y-3">
            {chats.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onOpenChat(c.id)}
                  className="w-full text-left bg-white p-4 rounded-xl ring-1 ring-gray-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9C86F7]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold">{c.title}</p>
                      <p className="mt-1 text-[13px] text-gray-600">
                        {c.lastMessage}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-[12px] text-gray-500">
                      {c.updatedAt}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
