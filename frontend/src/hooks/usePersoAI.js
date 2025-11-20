// frontend/src/hooks/usePersoAI.js

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

/**
 * PersoAI SDK 통합을 위한 React Hook
 * 
 * 사용법:
 * const { 
 *   initialized, 
 *   loading, 
 *   error, 
 *   config,
 *   loadConfig,
 *   createSession 
 * } = usePersoAI();
 */
export function usePersoAI() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  /**
   * SDK 초기화 확인
   */
  useEffect(() => {
    const checkSDK = () => {
      if (window.PersoLiveSDK) {
        setInitialized(true);
        logger.log('✅ PersoLive SDK 준비 완료');
      } else {
        logger.warn('⚠️ PersoLive SDK가 아직 로드되지 않았습니다');
        setTimeout(checkSDK, 100);
      }
    };

    checkSDK();
  }, []);

  /**
   * 전체 설정 로드
   */
  const loadConfig = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      logger.log('🔄 설정 로드 시작...');

      const url = `/raon/api/backoffice/configurations?forceRefresh=${forceRefresh}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`설정 로드 실패: ${response.status}`);
      }

      const data = await response.json();
      setConfig(data);

      logger.log('✅ 설정 로드 완료:', {
        prompts: data.prompts?.length || 0,
        documents: data.documents?.length || 0,
        backgrounds: data.backgroundImages?.length || 0,
        modelStyles: data.modelStyles?.length || 0,
        llms: data.llmModels?.length || 0,
        tts: data.ttsModels?.length || 0,
      });

      return data;
    } catch (err) {
      logger.error('❌ 설정 로드 실패:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 채팅 세션 생성
   */
  const createSession = useCallback(async (sessionConfig) => {
    if (!initialized) {
      throw new Error('SDK가 초기화되지 않았습니다');
    }

    setLoading(true);
    setError(null);

    try {
      logger.log('🔄 세션 생성 시작...', sessionConfig);

      // 백엔드 API로 세션 생성 요청
      const response = await fetch('/raon/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 인증 쿠키 포함
        body: JSON.stringify(sessionConfig),
      });

      if (!response.ok) {
        throw new Error(`세션 생성 실패: ${response.status}`);
      }

      const session = await response.json();
      logger.log('✅ 세션 생성 완료:', session);

      return session;
    } catch (err) {
      logger.error('❌ 세션 생성 실패:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  /**
   * SDK 세션 초기화 (WebRTC) - 재시도 로직 포함
   */
  const initializeSDKSession = useCallback(async (sessionId, width, height, enableVoice, maxRetries = 2) => {
    if (!initialized) {
      throw new Error('SDK가 초기화되지 않았습니다');
    }

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.log(`🔄 SDK 세션 초기화 시도 ${attempt}/${maxRetries}...`, { sessionId, width, height, enableVoice });

        // 먼저 API 자격증명 가져오기
        const credResponse = await fetch('/raon/api/persoai/credentials');
        if (!credResponse.ok) {
          throw new Error('자격증명 로드 실패');
        }

        const credentials = await credResponse.json();

        // SDK로 세션 초기화
        const sdkSession = await window.PersoLiveSDK.createSession(
          credentials.apiServer,
          sessionId,
          width,
          height,
          enableVoice
        );

        logger.log(`✅ SDK 세션 초기화 완료 (시도 ${attempt}/${maxRetries})`);
        return sdkSession;
      } catch (err) {
        lastError = err;
        logger.warn(`⚠️ SDK 세션 초기화 실패 (시도 ${attempt}/${maxRetries}):`, err.message);

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000; // 2초, 4초 간격으로 대기
          logger.log(`⏳ ${waitTime/1000}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // 모든 재시도 실패
    logger.error(`❌ SDK 세션 초기화 완전 실패 (${maxRetries}회 시도)`, lastError);
    throw lastError;
  }, [initialized]);

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(async (sessionId, message) => {
    try {
      logger.log('📤 메시지 전송:', { sessionId, message });

      const response = await fetch(`/raon/api/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`메시지 전송 실패: ${response.status}`);
      }

      const result = await response.json();
      logger.log('✅ 메시지 전송 완료:', result);

      return result;
    } catch (err) {
      logger.error('❌ 메시지 전송 실패:', err);
      throw err;
    }
  }, []);

  /**
   * 세션 종료
   */
  const terminateSession = useCallback(async (sessionId) => {
    try {
      logger.log('🔄 세션 종료 시작:', sessionId);

      const response = await fetch(`/raon/api/sessions/${sessionId}/terminate`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`세션 종료 실패: ${response.status}`);
      }

      logger.log('✅ 세션 종료 완료');
    } catch (err) {
      logger.error('❌ 세션 종료 실패:', err);
      throw err;
    }
  }, []);

  return {
    // 상태
    initialized,
    loading,
    error,
    config,

    // 함수
    loadConfig,
    createSession,
    initializeSDKSession,
    sendMessage,
    terminateSession,
  };
}

/**
 * 사용 예제
 * 
 * function MyComponent() {
 *   const { 
 *     initialized, 
 *     loading, 
 *     config, 
 *     loadConfig, 
 *     createSession 
 *   } = usePersoAI();
 * 
 *   useEffect(() => {
 *     loadConfig();
 *   }, [loadConfig]);
 * 
 *   const handleStartChat = async () => {
 *     const sessionConfig = {
 *       promptId: selectedPrompt?.promptId,
 *       llmType: selectedLLM?.name,
 *       ttsType: selectedTTS?.name,
 *       // ...
 *     };
 * 
 *     const session = await createSession(sessionConfig);
 *     // SDK 세션 초기화...
 *   };
 * 
 *   if (!initialized) return <div>SDK 로딩 중...</div>;
 *   if (loading) return <div>로딩 중...</div>;
 * 
 *   return (
 *     <div>
 *       <button onClick={loadConfig}>설정 새로고침</button>
 *       <button onClick={handleStartChat}>채팅 시작</button>
 *     </div>
 *   );
 * }
 */