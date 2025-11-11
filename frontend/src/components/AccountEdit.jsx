// src/components/AccountEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가

export default function AccountEdit({ onSaved = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate(); // ✅ 추가

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/raon/api/users/me", { credentials: "include" });
        if (res.ok) {
          const me = await res.json();
          if (!stop) setNickname(me?.nickname ?? "");
        }
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setMsg("닉네임을 입력해주세요.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/raon/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      if (!res.ok) throw new Error("저장 실패");

      // ✅ App 상태 갱신(TopBar 즉시 반영) 후 홈으로 이동
      const newName = nickname.trim();
      onSaved(newName);
      navigate("/", { replace: true }); // ← 저장 성공 시 홈 이동

    } catch (err) {
      setMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!window.confirm("정말 탈퇴하시겠어요?")) return;
    const res = await fetch("/raon/api/users/me", { method: "DELETE", credentials: "include" });
    if (res.ok) {
      navigate("/", { replace: true });
    } else {
      alert("탈퇴 실패");
    }
  };

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[#F5F2FF]">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-8 md:p-10">
            <h1 className="text-center text-2xl md:text-[26px] font-semibold mb-8">회원정보수정</h1>

            <form onSubmit={onSubmit} className="grid gap-5">
              <label className="grid gap-2">
                <span className="sr-only">닉네임</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B899FF]"
                />
              </label>

              <div className="flex items-center justify-end text-xs">
                <button type="button" onClick={onDeleteAccount} className="text-gray-500 hover:text-gray-700">
                  회원탈퇴
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-1 w-full rounded-xl bg-[#D8C8FF] hover:bg-[#cdbaff] text-black font-medium py-3 transition disabled:opacity-60"
              >
                {saving ? "저장 중…" : "확인"}
              </button>

              {!!msg && <p className="text-center text-sm text-gray-700">{msg}</p>}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
