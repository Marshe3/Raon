import React from "react";

function KakaoIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5c-5.247 0-9.5 3.338-9.5 7.457 0 2.615 1.79 4.91 4.51 6.205l-.55 3.338a.6.6 0 0 0 .9.63l3.685-2.226c.308.024.62.036.955.036 5.247 0 9.5-3.338 9.5-7.457S17.247 3.5 12 3.5z"
        fill="#3A1D1D"
      />
    </svg>
  );
}

function GoogleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M43.6 24.5c0-1.4-.1-2.4-.3-3.5H24v6.6h11.3c-.2 1.6-1.4 4-3.8 5.6l-.03.2 5.5 4.2.4.04C41.8 34.9 43.6 30.2 43.6 24.5z" fill="#4285F4"/>
      <path d="M24 44c5.4 0 9.9-1.8 13.2-4.8l-6.3-4.8c-1.7 1.2-4 2-6.9 2-5.3 0-9.7-3.5-11.3-8.4l-.2.02-6.5 5.1-.08.18C9.6 39.7 16.2 44 24 44z" fill="#34A853"/>
      <path d="M12.7 28c-.4-1.2-.7-2.6-.7-4s.2-2.8.7-4l-.01-.27-6.6-5.1-.22.1C4.7 17.9 4 21.1 4 24s.7 6.1 1.9 9.2L12.7 28z" fill="#FBBC05"/>
      <path d="M24 10.2c3.8 0 6.3 1.6 7.7 3l5.6-5.5C33.9 4.6 29.4 3 24 3 16.2 3 9.6 7.3 6 14l6.6 5.1C14.3 13.7 18.7 10.2 24 10.2z" fill="#EA4335"/>
    </svg>
  );
}

function RaonSocialLogin() {
  const handleKakaoLogin = () => {
    console.log('카카오 로그인 시도');
    window.location.href = '/raon/oauth2/authorization/kakao';
  };

  const handleGoogleLogin = () => {
    console.log('구글 로그인 시도');
    window.location.href = '/raon/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen bg-[#eef3ff] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[520px]">
          <div className="mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-10">
            <h1 className="text-center text-xl font-bold tracking-tight text-gray-900">RAON</h1>
            <p className="mt-2 text-center text-sm text-gray-600">소셜 로그인으로 간편하게 시작하세요</p>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleKakaoLogin}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5d900] bg-[#FEE500] px-4 py-3 text-sm font-semibold text-gray-900 transition active:scale-[0.99] hover:bg-[#fee929] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9C86F7]"
                aria-label="카카오로 시작하기"
              >
                <KakaoIcon className="h-5 w-5" />
                카카오로 시작하기
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition active:scale-[0.99] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9C86F7]"
                aria-label="구글로 시작하기"
              >
                <GoogleIcon className="h-5 w-5" />
                구글로 시작하기
              </button>
            </div>

            <p className="mt-6 text-center text-[11px] leading-5 text-gray-500">
              로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaonSocialLogin;