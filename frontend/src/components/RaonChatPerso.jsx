import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './RaonChat.css';
import { usePersoAI } from '../hooks/usePersoAI';
import { logger } from '../utils/logger';
import AvatarDisplay from './chat/AvatarDisplay';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';
import SideMenu from './chat/SideMenu';
import ErrorNotification from './chat/ErrorNotification';

const PERSO_SDK_URL = 'https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js';

function RaonChatPerso({ user, isLoggedIn }) {
  const { id: chatbotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // usePersoAI 훅 사용
  const {
    initializeSDKSession
  } = usePersoAI();

  // 아바타 선택 페이지에서 전달받은 정보
  const avatarConfig = location.state || {};

  // sdkConfig 복구: sessionStorage에서 불러오기 (재연결 시)
  const savedSdkConfig = sessionStorage.getItem('raon_sdk_config');
  const restoredSdkConfig = savedSdkConfig ? JSON.parse(savedSdkConfig) : null;

  const {
    sdkConfig: stateSdkConfig, // SDK 세션 생성 설정
    avatarName,
    personality,
    backgroundImage
  } = avatarConfig;

  // sdkConfig는 state에서 받은 것을 우선, 없으면 복구된 것 사용
  const sdkConfig = stateSdkConfig || restoredSdkConfig;

  // PersoAI SDK 관련 상태
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [persoSession, setPersoSession] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const videoRef = useRef(null);

  // 메시지 목록
  const [messages, setMessages] = useState([]);

  // 입력창 텍스트
  const [inputText, setInputText] = useState('');

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [_isAiResponding, setIsAiResponding] = useState(false); // AI 응답 대기 중 (향후 UI에서 사용 예정)

  // 메뉴 열림/닫힘
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // TTS 켜짐/꺼짐
  const [isTTSOn, setIsTTSOn] = useState(true);

  // STT (음성 입력) 상태
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(''); // 인식된 텍스트 임시 저장

  // 녹음 관련
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // 복원된 메시지 보관 (재연결 시 유지용)
  const restoredMessagesRef = useRef(null);

  // 이전 채팅 로그 길이 추적 (새 메시지 감지용)
  const prevChatLogLengthRef = useRef(0);

  // AI 메시지를 백엔드에 저장하는 헬퍼 함수
  const saveAIMessageToBackend = async (content) => {
    const sessionId = sessionStorage.getItem('raon_session_id');
    if (!sessionId) return;

    try {
      await fetch(`/raon/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          role: 'assistant',
          content: content
        })
      });
      logger.log('💾 AI message saved to backend');
    } catch (err) {
      logger.warn('⚠️ Failed to save AI message to backend:', err);
    }
  };

  // 메시지 변경 시 자동 저장 (재연결 시 복원용) - 세션 ID별로 구분
  useEffect(() => {
    const sessionId = sessionStorage.getItem('raon_session_id');
    if (messages.length > 0 && sessionId) {
      const sessionKey = `raon_chat_messages_${sessionId}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(messages));
      logger.log('💾 Messages saved for session:', sessionId, messages.length);
    }
  }, [messages]);

  // sdkConfig 저장 (재연결 시 복원용)
  useEffect(() => {
    if (sdkConfig) {
      sessionStorage.setItem('raon_sdk_config', JSON.stringify(sdkConfig));
      logger.log('💾 SDK Config saved:', sdkConfig);
    }
  }, [sdkConfig]);

  // PersoAI SDK 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = PERSO_SDK_URL;
    script.async = true;
    script.onload = () => {
      logger.log('PersoAI SDK loaded');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      setError('PersoAI SDK 로드 실패');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // SDK 로드 완료 후 자동으로 세션 재연결 시도
  useEffect(() => {
    if (sdkLoaded && sdkConfig && !isSessionActive) {
      logger.log('🔄 SDK loaded and config available, trying to restore session...');
      tryRestoreSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkLoaded, sdkConfig]);

  // TTS ON/OFF 제어
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isTTSOn;

      // 오디오 트랙도 제어
      const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
      audioTracks.forEach(track => {
        track.enabled = isTTSOn;
      });

      logger.log(`🔊 TTS ${isTTSOn ? 'ON' : 'OFF'}`);
    }
  }, [isTTSOn]);

  // 세션 재연결 시도 (저장된 세션 ID 사용)
  const tryRestoreSession = async () => {
    const savedSessionId = sessionStorage.getItem('raon_session_id');

    if (!savedSessionId) {
      logger.log('💡 No saved session ID found');
      return false;
    }

    if (!sdkConfig) {
      logger.log('💡 No SDK config found, cannot restore session');
      return false;
    }

    logger.log('🔄 Attempting to restore session:', savedSessionId);

    try {
      // 백엔드 API로 세션 유효성 확인
      const response = await fetch(`/raon/api/sessions/${savedSessionId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        logger.log('⚠️ Saved session is invalid or expired');
        sessionStorage.removeItem('raon_session_id');
        return false;
      }

      const sessionData = await response.json();
      logger.log('✅ Saved session is still valid:', sessionData.sessionId);

      // SDK로 WebRTC 세션 재초기화
      const session = await initializeSDKSession(savedSessionId, 1920, 1080, false);
      logger.log('✅ WebRTC session reconnected');

      // 비디오 엘리먼트에 연결
      if (videoRef.current) {
        session.setSrc(videoRef.current);
        videoRef.current.muted = !isTTSOn;
        videoRef.current.volume = 1.0;

        const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
        audioTracks.forEach(track => {
          track.enabled = isTTSOn;
        });

        videoRef.current.play().catch(err => {
          logger.warn('Video play warning:', err.message);
        });
      }

      // 인트로 메시지 생성
      const introMessage = {
        id: 0,
        type: 'ai',
        text: sdkConfig?.introMessage || '안녕하세요!',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };

      // 채팅 로그 구독 (createSession과 동일한 로직)
      session.subscribeChatLog((chatLog) => {
        if (chatLog.length === 0 && restoredMessagesRef.current) {
          logger.log('📋 Keeping restored messages (empty server log)');
          return;
        }

        const sortedChatLog = [...chatLog].sort((a, b) => a.timestamp - b.timestamp);

        // 새로운 AI 메시지 감지 및 백엔드 저장
        if (sortedChatLog.length > prevChatLogLengthRef.current) {
          const newMessages = sortedChatLog.slice(prevChatLogLengthRef.current);
          newMessages.forEach(msg => {
            if (!msg.isUser) {
              saveAIMessageToBackend(msg.text);
            }
          });
          prevChatLogLengthRef.current = sortedChatLog.length;
        }

        const chatMessages = sortedChatLog.map((chat, index) => ({
          id: chat.timestamp + index + 1,
          type: chat.isUser ? 'user' : 'ai',
          text: chat.text,
          time: new Date(chat.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }));

        if (sortedChatLog.length > 0 && !sortedChatLog[sortedChatLog.length - 1].isUser) {
          setIsAiResponding(false);
        }

        if (chatLog.length > 0 && restoredMessagesRef.current) {
          logger.log('📡 New server messages received, clearing restored state');
          restoredMessagesRef.current = null;
        }

        const allMessages = [introMessage, ...chatMessages];

        if (sortedChatLog.length > 0 && sortedChatLog[sortedChatLog.length - 1].isUser) {
          allMessages.push({
            id: 'loading',
            type: 'ai',
            text: '입력 중...',
            time: new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            isLoading: true
          });
        }

        setMessages(allMessages);
      });

      // 세션 종료 이벤트 구독
      session.onClose((manualClosed) => {
        logger.log('🔴 Session closed. Manual:', manualClosed);

        if (!manualClosed) {
          logger.log('🔄 Attempting auto-reconnect...');
          setError('연결이 끊어졌습니다. 5초 후 자동으로 재연결하며 이전 대화를 복원합니다...');

          setTimeout(() => {
            logger.log('🔄 Auto-reconnecting with previous conversation...');
            setError('재연결 중...');
            createSession();
          }, 5000);
        } else {
          setError(null);
        }

        setIsSessionActive(false);
        setPersoSession(null);
      });

      setPersoSession(session);
      setIsSessionActive(true);

      // 백엔드에서 채팅 기록 복원 (우선순위 1)
      try {
        const messagesResponse = await fetch(`/raon/api/sessions/${savedSessionId}/messages`, {
          credentials: 'include'
        });

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          logger.log('📥 Messages loaded from backend:', messagesData.length);

          if (messagesData.length > 0) {
            const restoredMessages = messagesData.map(msg => ({
              id: msg.messageId,
              type: msg.role === 'user' ? 'user' : 'ai',
              text: msg.content,
              time: new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            }));

            // 인트로 메시지가 없으면 추가
            const hasIntro = restoredMessages.some(m => m.type === 'ai' && m.id === 0);
            if (!hasIntro) {
              restoredMessages.unshift({
                id: 0,
                type: 'ai',
                text: sdkConfig?.introMessage || '안녕하세요!',
                time: new Date().toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              });
            }

            setMessages(restoredMessages);
            restoredMessagesRef.current = restoredMessages;
            logger.log('✅ Messages restored from backend');
            return true;
          }
        }
      } catch (err) {
        logger.warn('⚠️ Failed to load messages from backend, trying sessionStorage:', err);
      }

      // sessionStorage에서 채팅 기록 복원 (우선순위 2 - 백엔드 실패 시)
      const sessionKey = `raon_chat_messages_${savedSessionId}`;
      const savedMessages = sessionStorage.getItem(sessionKey);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          logger.log('📥 Restoring messages from sessionStorage:', parsedMessages.length);
          setMessages(parsedMessages);
          restoredMessagesRef.current = parsedMessages;
        } catch (e) {
          logger.error('❌ Failed to restore messages:', e);
          const defaultMessage = [{
            id: 0,
            type: 'ai',
            text: sdkConfig?.introMessage || '안녕하세요!',
            time: new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }];
          setMessages(defaultMessage);
          restoredMessagesRef.current = null;
        }
      } else {
        // 저장된 메시지 없음 - 인트로 메시지만 표시
        const defaultMessage = [{
          id: 0,
          type: 'ai',
          text: sdkConfig?.introMessage || '안녕하세요!',
          time: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }];
        setMessages(defaultMessage);
      }

      logger.log('✅ Session restored successfully');
      return true;

    } catch (err) {
      logger.error('❌ Session restoration failed:', err);
      sessionStorage.removeItem('raon_session_id');
      return false;
    }
  };

  // 세션 생성 (백엔드 API 사용)
  const createSession = async () => {
    if (!sdkLoaded || !window.PersoLiveSDK) {
      setError('아바타 SDK가 로드되지 않았습니다');
      return;
    }

    if (!videoRef.current) {
      setError('비디오 요소가 준비되지 않았습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.log('=== Creating PersoAI Session via Backend ===');

      // sdkConfig 검증 (백오피스에서 전달받아야 함)
      if (!sdkConfig) {
        throw new Error('세션 설정이 전달되지 않았습니다. 백오피스에서 설정을 선택해주세요.');
      }

      // sdkConfig에서 설정 가져오기 (하드코딩 제거)
      const llmType = sdkConfig.llmType;
      const ttsType = sdkConfig.ttsType;
      const modelStyle = sdkConfig.modelStyle;
      const promptId = sdkConfig.promptId;
      const documentId = sdkConfig.documentId || null;
      const backgroundImageId = sdkConfig.backgroundImageId || null;

      if (!llmType || !ttsType || !promptId) {
        throw new Error('필수 세션 설정(LLM, TTS, Prompt)이 누락되었습니다.');
      }

      logger.log('✓ Session Config:', { llmType, ttsType, modelStyle, promptId, documentId, backgroundImageId });

      // 백엔드 API로 세션 생성 요청
      const sttType = sdkConfig?.sttType || null;

      // 이전 채팅방 ID 확인 (같은 채팅방에서 대화 이어가기)
      const previousChatRoomId = sessionStorage.getItem('raon_chat_room_id');

      const sessionCreateRequest = {
        promptId: promptId,
        llmType: llmType,
        ttsType: ttsType,
        sttType: sttType,
        modelStyle: modelStyle,
        documentId: documentId,
        backgroundImageId: backgroundImageId,
        agent: 1,
        paddingLeft: 0,
        paddingTop: 0,
        paddingHeight: 1,
        previousChatRoomId: previousChatRoomId ? parseInt(previousChatRoomId) : null
      };

      logger.log('✓ STT Type:', sttType);
      if (previousChatRoomId) {
        logger.log('✓ Previous Chat Room ID:', previousChatRoomId);
        logger.log('🔗 이전 대화 컨텍스트가 AI에게 전달됩니다');
      }

      const response = await fetch('/raon/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sessionCreateRequest),
      });

      if (!response.ok) {
        throw new Error(`세션 생성 실패: ${response.status}`);
      }

      const sessionResponse = await response.json();
      const createdSessionId = sessionResponse.sessionId;
      const chatRoomId = sessionResponse.chatRoomId;
      logger.log('✓ Session ID created via backend:', createdSessionId);
      logger.log('✓ Chat Room ID:', chatRoomId);

      // 세션 ID 저장 (재연결용)
      sessionStorage.setItem('raon_session_id', createdSessionId);
      logger.log('💾 Session ID saved for reconnection');

      // 채팅방 ID 저장 (컨텍스트 연결용)
      if (chatRoomId) {
        sessionStorage.setItem('raon_chat_room_id', chatRoomId);
        logger.log('💾 Chat Room ID saved for context continuity');
      }

      // SDK로 WebRTC 세션 초기화
      // 참고: 음성 입력은 브라우저의 Web Speech API를 사용하므로 enableVoice는 false
      const session = await initializeSDKSession(createdSessionId, 1920, 1080, false);
      logger.log('✓ WebRTC session created');
      if (sttType) {
        logger.log('✓ STT enabled: 브라우저 음성 인식 사용 가능');
      }

      // 비디오 엘리먼트에 연결
      session.setSrc(videoRef.current);

      // 비디오 요소 음성 활성화 (TTS 상태에 따라)
      if (videoRef.current) {
        videoRef.current.muted = !isTTSOn;
        videoRef.current.volume = 1.0;

        const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
        audioTracks.forEach(track => {
          track.enabled = isTTSOn;
        });

        videoRef.current.play().catch(err => {
          logger.warn('Video play warning:', err.message);
        });
      }

      // 인트로 메시지 생성 (한 번만 생성하여 재사용)
      const introMessage = {
        id: 0,
        type: 'ai',
        text: sdkConfig?.introMessage || '안녕하세요!',
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };

      // 채팅 로그 구독
      session.subscribeChatLog((chatLog) => {
        // 재연결 후 첫 번째 호출이고 서버 메시지가 비어있으면 복원된 메시지 유지
        if (chatLog.length === 0 && restoredMessagesRef.current) {
          logger.log('📋 Keeping restored messages (empty server log)');
          return; // 복원된 메시지를 유지하고 종료
        }

        // timestamp 기준 오름차순 정렬 (오래된 메시지가 위, 최신 메시지가 아래)
        const sortedChatLog = [...chatLog].sort((a, b) => a.timestamp - b.timestamp);

        // 새로운 AI 메시지 감지 및 백엔드 저장
        if (sortedChatLog.length > prevChatLogLengthRef.current) {
          const newMessages = sortedChatLog.slice(prevChatLogLengthRef.current);
          newMessages.forEach(msg => {
            if (!msg.isUser) {
              saveAIMessageToBackend(msg.text);
            }
          });
          prevChatLogLengthRef.current = sortedChatLog.length;
        }

        const chatMessages = sortedChatLog.map((chat, index) => ({
          id: chat.timestamp + index + 1, // timestamp 기반 고유 ID (인트로 메시지는 id 0)
          type: chat.isUser ? 'user' : 'ai',
          text: chat.text,
          time: new Date(chat.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }));

        // 마지막 메시지가 AI 응답이면 로딩 상태 해제
        if (sortedChatLog.length > 0 && !sortedChatLog[sortedChatLog.length - 1].isUser) {
          setIsAiResponding(false);
        }

        // 서버에 새 메시지가 있으면 복원 상태 해제
        if (chatLog.length > 0 && restoredMessagesRef.current) {
          logger.log('📡 New server messages received, clearing restored state');
          restoredMessagesRef.current = null;
        }

        // 인트로 메시지를 항상 첫 번째로 유지
        const allMessages = [introMessage, ...chatMessages];

        // AI 응답 대기 중이고, 마지막 메시지가 사용자 메시지이면 로딩 표시
        if (sortedChatLog.length > 0 && sortedChatLog[sortedChatLog.length - 1].isUser) {
          allMessages.push({
            id: 'loading',
            type: 'ai',
            text: '입력 중...',
            time: new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            isLoading: true
          });
        }

        setMessages(allMessages);
      });

      // 세션 종료 이벤트 구독
      session.onClose((manualClosed) => {
        logger.log('🔴 Session closed. Manual:', manualClosed);

        if (!manualClosed) {
          // 예기치 않은 종료 - 자동 재연결 시도
          logger.log('🔄 Attempting auto-reconnect...');
          setError('연결이 끊어졌습니다. 5초 후 자동으로 재연결하며 이전 대화를 복원합니다...');

          // 5초 후 자동 재연결
          setTimeout(() => {
            logger.log('🔄 Auto-reconnecting with previous conversation...');
            setError('재연결 중...');
            createSession();
          }, 5000);
        } else {
          // 수동 종료
          setError(null);
        }

        setIsSessionActive(false);
        setPersoSession(null);
      });

      setPersoSession(session);
      setIsSessionActive(true);

      logger.log('=== Session Setup Complete ===');
      logger.log('📝 SDK Config:', sdkConfig);
      logger.log('📝 Intro Message:', sdkConfig?.introMessage);

      // 자동 재연결 시 이전 대화 복원 (previousChatRoomId가 있으면 자동 재연결)
      if (previousChatRoomId) {
        try {
          logger.log('🔄 Auto-reconnect detected, loading previous messages from chatRoomId:', previousChatRoomId);
          const messagesResponse = await fetch(`/raon/api/chatrooms/${previousChatRoomId}/messages`, {
            credentials: 'include'
          });

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            logger.log('📥 Previous messages loaded from chatroom:', messagesData.length);

            if (messagesData.length > 0) {
              const restoredMessages = messagesData.map(msg => ({
                id: msg.messageId,
                type: msg.role === 'user' ? 'user' : 'ai',
                text: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              }));

              // 인트로 메시지가 없으면 추가
              const hasIntro = restoredMessages.some(m => m.type === 'ai' && m.id === 0);
              if (!hasIntro) {
                restoredMessages.unshift({
                  id: 0,
                  type: 'ai',
                  text: sdkConfig?.introMessage || '안녕하세요!',
                  time: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                });
              }

              setMessages(restoredMessages);
              restoredMessagesRef.current = restoredMessages;
              logger.log('✅ Previous conversation restored on auto-reconnect');

              // 재연결 성공 메시지 표시 후 3초 뒤 자동 제거
              setError('✅ 재연결 완료! 이전 대화가 복원되었습니다.');
              setTimeout(() => {
                setError(null);
              }, 3000);

              return; // 복원 성공 시 종료
            }
          }
        } catch (err) {
          logger.warn('⚠️ Failed to load previous messages on auto-reconnect:', err);
        }
      }

      // 자동 재연결이 아니거나 메시지 로드 실패 시: 세션 ID별 sessionStorage에서 복원 시도
      const sessionKey = `raon_chat_messages_${createdSessionId}`;
      const savedMessages = sessionStorage.getItem(sessionKey);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          logger.log('📥 Restoring saved messages from sessionStorage:', parsedMessages.length);
          setMessages(parsedMessages);
          restoredMessagesRef.current = parsedMessages;
        } catch (e) {
          logger.error('❌ Failed to restore messages:', e);
          // 복원 실패 시 기본 인트로 메시지 설정
          const defaultMessage = [{
            id: 1,
            type: 'ai',
            text: sdkConfig?.introMessage || '안녕하세요!',
            time: new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          }];
          setMessages(defaultMessage);
          restoredMessagesRef.current = null;
        }
      } else {
        // 저장된 메시지가 없으면 기본 인트로 메시지 설정
        const defaultMessage = [{
          id: 1,
          type: 'ai',
          text: sdkConfig?.introMessage || '안녕하세요!',
          time: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }];
        setMessages(defaultMessage);
        restoredMessagesRef.current = null;
      }

    } catch (err) {
      setError('세션 생성 중 오류가 발생했습니다: ' + err.message);
      logger.error('❌ Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (PersoAI SDK 사용)
  const handleSendMessage = async () => {
    if (!inputText.trim() || !persoSession) return;

    const userMessage = inputText;
    const sessionId = sessionStorage.getItem('raon_session_id');
    setInputText('');

    // AI 응답 대기 상태 활성화
    setIsAiResponding(true);

    // 백엔드에 사용자 메시지 저장
    if (sessionId) {
      try {
        await fetch(`/raon/api/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            role: 'user',
            content: userMessage
          })
        });
        logger.log('💾 User message saved to backend');
      } catch (err) {
        logger.warn('⚠️ Failed to save user message to backend:', err);
      }
    }

    // SDK를 통해 메시지 전송
    persoSession.processChat(userMessage);
  };

  // Web Speech API 초기화
  useEffect(() => {
    if (!sdkConfig?.sttType) return;

    // 브라우저가 Web Speech API를 지원하는지 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      logger.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다');
      return;
    }

    // Speech Recognition 인스턴스 생성
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.continuous = true; // 계속 듣기 (사용자가 중지할 때까지)
    recognition.interimResults = true; // 중간 결과 활성화 (실시간 인식)

    // 음성 인식 결과 처리
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // 모든 인식 결과를 처리
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // 최종 확정된 텍스트
          finalTranscript += transcript;
        } else {
          // 중간 결과 (아직 확정되지 않음)
          interimTranscript += transcript;
        }
      }

      // 최종 확정된 텍스트를 누적
      if (finalTranscript) {
        transcriptRef.current += finalTranscript + ' ';
        logger.log('🎤 음성 인식 결과 (확정):', finalTranscript);
        logger.log('🎤 전체 누적 텍스트:', transcriptRef.current);
      }

      // 중간 결과도 로그에 표시
      if (interimTranscript) {
        logger.log('🎤 음성 인식 중 (임시):', interimTranscript);
      }
    };

    // 음성 인식 종료 처리
    recognition.onend = () => {
      logger.log('🎤 음성 인식 종료');

      // 녹음 중지 (자동으로 파일 저장됨)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // 누적된 텍스트가 있으면 전송
      const fullText = transcriptRef.current.trim();
      if (persoSession && fullText) {
        logger.log('📤 최종 전송할 텍스트:', fullText);
        persoSession.processChat(fullText);
        transcriptRef.current = ''; // 초기화
      }

      setIsListening(false);
    };

    // 음성 인식 오류 처리
    recognition.onerror = (event) => {
      logger.error('🎤 음성 인식 오류:', event.error);
      let errorMessage = '음성 인식 오류가 발생했습니다';

      // 녹음 중지 (자동으로 파일 저장됨)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      switch (event.error) {
        case 'no-speech':
          errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
          break;
        case 'audio-capture':
          errorMessage = '마이크를 사용할 수 없습니다.';
          break;
        case 'not-allowed':
          errorMessage = '마이크 권한이 거부되었습니다.';
          break;
        case 'aborted':
          // 사용자가 의도적으로 중지한 경우 에러 메시지 표시 안함
          logger.log('🎤 사용자가 음성 인식을 중지했습니다');
          break;
        default:
          errorMessage = '알 수 없는 오류가 발생했습니다.';
          break;
      }

      if (event.error !== 'aborted') {
        setError(errorMessage);
      }

      setIsListening(false);
      transcriptRef.current = ''; // 오류 시 누적 텍스트 초기화
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      // 녹음 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [sdkConfig?.sttType, persoSession]);

  // 녹음 시작
  const startRecording = async () => {
    try {
      // 마이크 권한 요청 및 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // MediaRecorder 초기화
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 녹음 데이터 수집
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 종료 시 파일 저장
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 자동 다운로드
        const link = document.createElement('a');
        link.href = audioUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `raon-voice-${timestamp}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        logger.log('🎙️ 녹음 파일 저장 완료:', link.download);

        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // 메모리 정리
        URL.revokeObjectURL(audioUrl);
      };

      // 녹음 시작
      mediaRecorder.start();
      logger.log('🎙️ 녹음 시작');
    } catch (err) {
      logger.error('🎙️ 녹음 시작 실패:', err);
      setError('녹음을 시작할 수 없습니다: ' + err.message);
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      logger.log('🎙️ 녹음 종료');
    }
  };

  // 음성 입력 시작/중지
  const toggleVoiceInput = async () => {
    if (!persoSession || !isSessionActive) {
      setError('세션이 활성화되지 않았습니다');
      return;
    }

    if (!sdkConfig?.sttType) {
      setError('STT가 설정되지 않았습니다. 백오피스에서 STT 모델을 선택해주세요.');
      return;
    }

    if (!recognitionRef.current) {
      setError('음성 인식 기능을 사용할 수 없습니다.');
      return;
    }

    try {
      if (!isListening) {
        // 음성 입력 및 녹음 시작
        logger.log('🎤 음성 입력 시작 - 다시 클릭하면 종료됩니다');
        transcriptRef.current = ''; // 누적 텍스트 초기화
        setIsListening(true);

        // 녹음 시작
        await startRecording();

        // 음성 인식 시작
        recognitionRef.current.start();
      } else {
        // 음성 입력 및 녹음 중지 - 사용자가 버튼을 다시 클릭
        logger.log('🎤 음성 입력 중지 (사용자 클릭)');

        // 음성 인식 중지 (onend 이벤트가 호출되어 텍스트 전송)
        recognitionRef.current.stop();

        // 녹음 중지 (자동으로 파일 저장됨)
        stopRecording();
      }
    } catch (err) {
      logger.error('음성 입력 오류:', err);
      setError('음성 입력 중 오류가 발생했습니다: ' + err.message);
      setIsListening(false);
      transcriptRef.current = ''; // 오류 시 초기화
      stopRecording(); // 오류 시 녹음도 중지
    }
  };

  // 세션 종료
  const endSession = async () => {
    if (persoSession) {
      try {
        const sessionId = sessionStorage.getItem('raon_session_id');
        persoSession.close();
        setPersoSession(null);
        setIsSessionActive(false);
        setMessages([]);
        // 수동 종료 시 저장된 채팅 기록, 설정, 세션 ID 정리
        if (sessionId) {
          const sessionKey = `raon_chat_messages_${sessionId}`;
          sessionStorage.removeItem(sessionKey);
        }
        sessionStorage.removeItem('raon_sdk_config');
        sessionStorage.removeItem('raon_session_id');
        // ⚠️ 채팅방 ID는 유지 (같은 채팅방에서 계속 대화)
        // sessionStorage.removeItem('raon_chat_room_id'); <- 제거하지 않음
        // prevChatLogLength 초기화
        prevChatLogLengthRef.current = 0;
        logger.log('🗑️ Chat history, SDK config, and session ID cleared');
        logger.log('✅ Chat Room ID maintained for conversation continuity');
      } catch (err) {
        logger.error('Session close error:', err);
      }
    }
  };

  return (
    <div className="raon-wrapper">
      {/* 헤더 */}
      <div className="raon-header">
        <div className="raon-logo" onClick={() => navigate('/')}>RAON</div>
        <div className="raon-nav">
          <span onClick={() => navigate('/avatar')}>아바타</span>
          <span onClick={() => navigate('/chatrooms')}>채팅방</span>
          <span>요약</span>
          <span>노트</span>
          <span onClick={() => setIsMenuOpen(!isMenuOpen)}>메뉴</span>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 왼쪽: AI 아바타 */}
        <AvatarDisplay
          videoRef={videoRef}
          isSessionActive={isSessionActive}
          isLoading={isLoading}
          backgroundImage={backgroundImage}
          avatarName={avatarName}
          personality={personality}
          isTTSOn={isTTSOn}
          setIsTTSOn={setIsTTSOn}
          onStartSession={createSession}
          chatbotId={chatbotId}
          sdkConfig={sdkConfig}
          sdkLoaded={sdkLoaded}
        />

        {/* 오른쪽: 채팅 */}
        <div className="chat-container">
          <ChatMessages messages={messages} />
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessage}
            onToggleVoiceInput={toggleVoiceInput}
            isSessionActive={isSessionActive}
            isListening={isListening}
            sttType={sdkConfig?.sttType}
          />
        </div>
      </div>

      {/* 사이드 메뉴 */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isSessionActive={isSessionActive}
        onEndSession={endSession}
      />

      {/* 에러 알림 */}
      <ErrorNotification
        error={error}
        onClose={() => setError(null)}
      />
    </div>
  );
}

export default RaonChatPerso;
