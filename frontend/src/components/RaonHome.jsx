// src/components/RaonHome.jsx
import React from "react";

export default function RaonHome({
  chats = [],
  onNavigate = () => {},
  onOpenChat = () => {},
  onSeeMore = () => {},
}) {
  return (
    <div className="min-h-screen bg-[#EEF3FF]">
      {/* 전역 TopBar는 App.js에서 렌더됩니다. */}

      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-extrabold text-center">RAON</h1>
        <p className="text-sm text-center text-gray-700">
          AI 아바타와 함께하는 일상의 동반자
        </p>

        {/* 배너 */}
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
