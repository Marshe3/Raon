// src/components/AccountEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiJson } from "../lib/apiClient"; // ✅ 베이스 경로 + CSRF 자동
import { logger } from "../utils/logger";

export default function AccountEdit({ user, isLoggedIn, onSaved = () => {} }) {
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // 로그인 체크 - 로그인하지 않은 경우 3초 후 홈으로 리다이렉트
  useEffect(() => {
    if (!isLoggedIn) {
      logger.warn('⚠️ 로그인이 필요한 서비스입니다');
      const timer = setTimeout(() => {
        logger.log('🔄 홈페이지로 이동합니다');
        navigate('/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  // 내 정보 조회
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const me = await apiJson("/users/me", { method: "GET" }); // => /raon/api/users/me
        if (!stop) setNickname(me?.nickname ?? "");
      } catch (e) {
        if (!stop) setMsg("로그인이 필요합니다.");
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  // 저장
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setMsg("닉네임을 입력해주세요.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (res.status === 401) {
        setMsg("로그인이 필요합니다. 다시 로그인해주세요.");
        return;
      }
      if (res.status === 403) {
        setMsg("요청이 거부되었어요. 새로고침 후 다시 시도해주세요.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "저장 실패");
      }

      // ✅ TopBar 등 상위 상태 바로 반영
      onSaved(nickname.trim());
      // ✅ 홈으로 이동
      navigate("/", { replace: true });
    } catch (err) {
      setMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 탈퇴
  const onDeleteAccount = async () => {
    if (!window.confirm("정말 탈퇴하시겠어요?")) return;
    try {
      const res = await api("/users/me", { method: "DELETE" });
      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (res.status === 403) {
        alert("요청이 거부되었어요. 새로고침 후 다시 시도해주세요.");
        return;
      }
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "탈퇴 실패");
      }
      navigate("/", { replace: true });
    } catch (e) {
      alert(e.message || "탈퇴 요청 중 오류가 발생했습니다.");
    }
  };

  // 로그인하지 않은 경우 안내 화면 표시
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F2FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ marginBottom: '16px', color: '#333' }}>로그인이 필요합니다</h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            회원정보 수정을 하시려면 로그인이 필요합니다.<br/>
            3초 후 홈페이지로 이동합니다.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            홈페이지로 이동
          </button>
        </div>
      </div>
    );
  }

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
               
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="text-gray-500 hover:text-gray-700"
                >
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

              {!!msg && <p className="text-center text-sm text-red-600">{msg}</p>}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}