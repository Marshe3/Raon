// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ 라우터 추가
import "./index.css";
import App from "./App";

// React 에러 오버레이 비활성화 (PersoAI SDK 에러 등을 화면에 표시하지 않음)
if (process.env.NODE_ENV === 'development') {
  const showErrorOverlay = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
                           !process.env.REACT_APP_DISABLE_ERROR_OVERLAY;

  if (!showErrorOverlay) {
    // 에러 오버레이 iframe 제거
    const removeErrorOverlay = () => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) {
        overlay.remove();
      }
    };

    // MutationObserver로 에러 오버레이가 추가되는 것을 감시하고 제거
    const observer = new MutationObserver(() => {
      removeErrorOverlay();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* ✅ 앱 전체를 단 한 번만 BrowserRouter로 감싸기 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
