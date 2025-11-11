// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ 라우터 추가
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* ✅ 앱 전체를 단 한 번만 BrowserRouter로 감싸기 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
