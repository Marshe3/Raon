import { logger } from './logger';

let isRefreshing = false;
let refreshSubscribers = [];

/**
 * 토큰 갱신 대기 중인 요청들을 저장하고 실행
 */
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

/**
 * 토큰 갱신 완료 후 대기 중인 모든 요청 실행
 */
function onTokenRefreshed(error) {
  refreshSubscribers.forEach(callback => callback(error));
  refreshSubscribers = [];
}

/**
 * Refresh Token을 사용하여 Access Token 갱신
 */
async function refreshAccessToken() {
  try {
    logger.log("🔄 Access Token 갱신 시도...");
    const response = await fetch("/raon/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    });

    if (response.ok) {
      logger.log("✅ Access Token 갱신 성공");
      return true;
    } else {
      logger.warn("⚠️ Access Token 갱신 실패 - 로그아웃 필요");
      return false;
    }
  } catch (error) {
    logger.error("❌ 토큰 갱신 오류:", error);
    return false;
  }
}

/**
 * Fetch Interceptor - 401 에러 시 자동으로 토큰 갱신 후 재시도
 *
 * @param {string} url - 요청 URL
 * @param {RequestInit} options - fetch options
 * @returns {Promise<Response>} - fetch response
 */
export async function fetchWithAuth(url, options = {}) {
  // credentials: 'include' 기본 설정 (쿠키 포함)
  const defaultOptions = {
    credentials: 'include',
    ...options
  };

  try {
    // 첫 번째 요청 시도
    let response = await fetch(url, defaultOptions);

    // 401 Unauthorized 응답 처리
    if (response.status === 401) {
      logger.log(`⚠️ 401 Unauthorized - ${url}`);

      // 이미 토큰 갱신 중이면 대기
      if (isRefreshing) {
        logger.log("⏳ 토큰 갱신 중... 대기");

        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((error) => {
            if (error) {
              reject(error);
            } else {
              // 토큰 갱신 성공 후 원래 요청 재시도
              fetch(url, defaultOptions).then(resolve).catch(reject);
            }
          });
        });
      }

      // 토큰 갱신 시작
      isRefreshing = true;

      try {
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
          // 토큰 갱신 성공 - 대기 중인 요청들 실행
          onTokenRefreshed(null);

          // 원래 요청 재시도
          logger.log(`🔁 요청 재시도 - ${url}`);
          response = await fetch(url, defaultOptions);
        } else {
          // 토큰 갱신 실패 - 로그아웃 처리
          const error = new Error('Token refresh failed');
          onTokenRefreshed(error);

          // 로그인 페이지로 리다이렉트
          logger.warn("🚪 토큰 갱신 실패 - 로그인 페이지로 이동");
          window.location.href = '/';
          throw error;
        }
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  } catch (error) {
    logger.error(`❌ API 요청 실패 - ${url}:`, error);
    throw error;
  }
}

/**
 * GET 요청 헬퍼 함수
 */
export async function apiGet(url) {
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * POST 요청 헬퍼 함수
 */
export async function apiPost(url, data) {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT 요청 헬퍼 함수
 */
export async function apiPut(url, data) {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * DELETE 요청 헬퍼 함수
 */
export async function apiDelete(url) {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
