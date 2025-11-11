// src/lib/apiClient.js  — CSRF 미사용 버전(간결)
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "/raon/api";

function joinUrl(base, path) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function api(path, options = {}) {
  const url = joinUrl(API_BASE, path);
  const method = (options.method || "GET").toUpperCase();

  // GET/HEAD/OPTIONS에는 Content-Type 안 붙여도 됨(불필요한 CORS 프리플라이트 방지)
  const defaultHeaders =
    method === "GET" || method === "HEAD" || method === "OPTIONS"
      ? {}
      : { "Content-Type": "application/json" };

  const res = await fetch(url, {
    method,
    credentials: options.credentials ?? "include",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    body: options.body,
    cache: options.cache || "no-cache",
    redirect: options.redirect || "follow",
  });
  return res;
}

export async function apiJson(path, options = {}) {
  const res = await api(path, options);
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`[${res.status}] ${res.url} - ${msg || "request failed"}`);
  }
  return res.json();
}

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}
