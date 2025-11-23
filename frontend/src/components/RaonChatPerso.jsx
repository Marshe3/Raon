import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './RaonChatPerso.css';
import { usePersoAI } from '../hooks/usePersoAI';
import { logger } from '../utils/logger';
import AvatarDisplay from './chat/AvatarDisplay';
import ChatMessages from './chat/ChatMessages';
import SideMenu from './chat/SideMenu';
import ErrorNotification from './chat/ErrorNotification';

const PERSO_SDK_URL = 'https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js';

function RaonChatPerso({ user, isLoggedIn }) {
  const { id: chatbotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { initializeSDKSession } = usePersoAI();

  const avatarConfig = location.state || {};
  const savedSdkConfig = sessionStorage.getItem('raon_sdk_config');
  const restoredSdkConfig = savedSdkConfig ? JSON.parse(savedSdkConfig) : null;

  const {
    sdkConfig: stateSdkConfig,
    avatarName,
    personality,
    backgroundImage
  } = avatarConfig;

  const sdkConfig = stateSdkConfig || restoredSdkConfig;

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

  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [persoSession, setPersoSession] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const videoRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBarOpen, setIsBarOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [_isAiResponding, setIsAiResponding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTTSOn, setIsTTSOn] = useState(true);
  const [hasRestorableHistory, setHasRestorableHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const restoredMessagesRef = useRef(null);
  const prevChatLogLengthRef = useRef(0);

  const toggleBar = () => {
    setIsBarOpen(!isBarOpen);
    if (!isBarOpen) {
      setActiveMode('chat');
      setIsChatOpen(true);
    } else {
      setIsChatOpen(false);
      setIsSearchMode(false);
    }
  };

  const switchToSearch = () => {
    setActiveMode('search');
    setIsSearchMode(true);
    setIsChatOpen(false);
  };

  const switchToChat = () => {
    setActiveMode('chat');
    setIsSearchMode(false);
    setIsChatOpen(true);
    setSearchText('');
    setSearchResults([]);
  };

  const handleSearch = (query) => {
    setSearchText(query);

    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results = [];
    messages.forEach((message, index) => {
      if (message.text && message.text.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          messageIndex: index,
          messageId: message.id,
          text: message.text,
          type: message.type
        });
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);

    if (results.length === 0) {
      setError(`"${query}" 검색 결과가 없습니다.`);
      setTimeout(() => setError(null), 2000);
    }
  };

  const goToNextResult = () => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length);
  };

  const goToPrevResult = () => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
  };

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

  useEffect(() => {
    const sessionId = sessionStorage.getItem('raon_session_id');
    if (messages.length > 0 && sessionId) {
      const sessionKey = `raon_chat_messages_${sessionId}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(messages));
      logger.log('💾 Messages saved for session:', sessionId, messages.length);
    }
  }, [messages]);

  useEffect(() => {
    if (sdkConfig) {
      sessionStorage.setItem('raon_sdk_config', JSON.stringify(sdkConfig));
      logger.log('💾 SDK Config saved:', sdkConfig);
    }
  }, [sdkConfig]);

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

  useEffect(() => {
    if (sdkLoaded && !isSessionActive) {
      checkRestorableHistory();
    }
  }, [sdkLoaded, isSessionActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isTTSOn;

      const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
      audioTracks.forEach(track => {
        track.enabled = isTTSOn;
      });

      logger.log(`🔊 TTS ${isTTSOn ? 'ON' : 'OFF'}`);
    }
  }, [isTTSOn]);

  const checkRestorableHistory = async () => {
    const savedSessionId = sessionStorage.getItem('raon_session_id');
    const chatRoomId = sessionStorage.getItem('raon_chat_room_id');

    if (savedSessionId || chatRoomId) {
      try {
        let hasMessages = false;

        if (chatRoomId) {
          const response = await fetch(`/raon/api/chatrooms/${chatRoomId}/messages`, {
            credentials: 'include'
          });
          if (response.ok) {
            const messages = await response.json();
            hasMessages = messages.length > 0;
          }
        } else if (savedSessionId) {
          const response = await fetch(`/raon/api/sessions/${savedSessionId}/messages`, {
            credentials: 'include'
          });
          if (response.ok) {
            const messages = await response.json();
            hasMessages = messages.length > 0;
          }
        }

        setHasRestorableHistory(hasMessages);
        if (hasMessages) {
          logger.log('📋 복원 가능한 대화 내역이 있습니다');
        }
      } catch (err) {
        logger.warn('⚠️ Failed to check restorable history:', err);
        setHasRestorableHistory(false);
      }
    } else {
      setHasRestorableHistory(false);
    }
  };

  const restoreChatHistory = async () => {
    const chatRoomId = sessionStorage.getItem('raon_chat_room_id');
    const savedSessionId = sessionStorage.getItem('raon_session_id');

    if (!chatRoomId && !savedSessionId) {
      setError('복원할 대화 내역이 없습니다.');
      return;
    }

    try {
      logger.log('📥 채팅 내역 복원 시작...');
      let messagesData = [];

      if (chatRoomId) {
        const response = await fetch(`/raon/api/chatrooms/${chatRoomId}/messages`, {
          credentials: 'include'
        });
        if (response.ok) {
          messagesData = await response.json();
          logger.log('📥 채팅방에서 메시지 로드:', messagesData.length);
        }
      }

      if (messagesData.length === 0 && savedSessionId) {
        const response = await fetch(`/raon/api/sessions/${savedSessionId}/messages`, {
          credentials: 'include'
        });
        if (response.ok) {
          messagesData = await response.json();
          logger.log('📥 세션에서 메시지 로드:', messagesData.length);
        }
      }

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
        setHasRestorableHistory(false);
        logger.log('✅ 채팅 내역 복원 완료:', restoredMessages.length);

        setError('✅ 이전 대화가 복원되었습니다!');
        setTimeout(() => setError(null), 3000);
      } else {
        setError('복원할 메시지가 없습니다.');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      logger.error('❌ 채팅 내역 복원 실패:', err);
      setError('채팅 내역 복원에 실패했습니다.');
      setTimeout(() => setError(null), 3000);
    }
  };

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

      if (!sdkConfig) {
        throw new Error('세션 설정이 전달되지 않았습니다. 백오피스에서 설정을 선택해주세요.');
      }

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

      const sttType = sdkConfig?.sttType || null;
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

      sessionStorage.setItem('raon_session_id', createdSessionId);
      logger.log('💾 Session ID saved for reconnection');

      if (chatRoomId) {
        sessionStorage.setItem('raon_chat_room_id', chatRoomId);
        logger.log('💾 Chat Room ID saved for context continuity');
      }

      const session = await initializeSDKSession(createdSessionId, 1920, 1080, false);
      logger.log('✓ WebRTC session created');
      if (sttType) {
        logger.log('✓ STT enabled: 브라우저 음성 인식 사용 가능');
      }

      session.setSrc(videoRef.current);

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

      session.subscribeChatLog((chatLog) => {
        const sortedChatLog = [...chatLog].sort((a, b) => a.timestamp - b.timestamp);

        if (sortedChatLog.length > prevChatLogLengthRef.current) {
          const newMessages = sortedChatLog.slice(prevChatLogLengthRef.current);
          newMessages.forEach(msg => {
            if (!msg.isUser) {
              saveAIMessageToBackend(msg.text);
            }
          });
          prevChatLogLengthRef.current = sortedChatLog.length;
        }

        const sdkMessages = sortedChatLog.map((chat, index) => ({
          id: chat.timestamp + index + 1,
          type: chat.isUser ? 'user' : 'ai',
          text: chat.text,
          time: new Date(chat.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }));

        let finalMessages = [];

        if (restoredMessagesRef.current && restoredMessagesRef.current.length > 0) {
          logger.log('📋 Merging restored messages with SDK messages');

          const restoredWithoutIntro = restoredMessagesRef.current.filter(m => m.id !== 0);
          const messageMap = new Map();

          restoredWithoutIntro.forEach(msg => {
            messageMap.set(msg.text, msg);
          });

          sdkMessages.forEach(msg => {
            if (!messageMap.has(msg.text)) {
              messageMap.set(msg.text, msg);
            }
          });

          finalMessages = Array.from(messageMap.values());

          if (sdkMessages.length > 0) {
            logger.log('📡 New SDK messages merged with restored messages');
            restoredMessagesRef.current = null;
          }
        } else {
          finalMessages = sdkMessages;
        }

        if (sortedChatLog.length > 0 && !sortedChatLog[sortedChatLog.length - 1].isUser) {
          setIsAiResponding(false);
        }

        const allMessages = [introMessage, ...finalMessages];

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

      logger.log('=== Session Setup Complete ===');
      logger.log('📝 SDK Config:', sdkConfig);
      logger.log('📝 Intro Message:', sdkConfig?.introMessage);

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

      if (previousChatRoomId || chatRoomId) {
        checkRestorableHistory();
      }

    } catch (err) {
      setError('세션 생성 중 오류가 발생했습니다: ' + err.message);
      logger.error('❌ Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !persoSession) return;

    const userMessage = inputText;
    const sessionId = sessionStorage.getItem('raon_session_id');
    setInputText('');

    setIsAiResponding(true);

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

    persoSession.processChat(userMessage);
  };

  useEffect(() => {
    if (!sdkConfig?.sttType) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      logger.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript + ' ';
        logger.log('🎤 음성 인식 결과 (확정):', finalTranscript);
        logger.log('🎤 전체 누적 텍스트:', transcriptRef.current);
      }

      if (interimTranscript) {
        logger.log('🎤 음성 인식 중 (임시):', interimTranscript);
      }
    };

    recognition.onend = () => {
      logger.log('🎤 음성 인식 종료');

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      const fullText = transcriptRef.current.trim();
      if (persoSession && fullText) {
        logger.log('📤 최종 전송할 텍스트:', fullText);
        persoSession.processChat(fullText);
        transcriptRef.current = '';
      }

      setIsListening(false);
    };

    recognition.onerror = (event) => {
      logger.error('🎤 음성 인식 오류:', event.error);
      let errorMessage = '음성 인식 오류가 발생했습니다';

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
      transcriptRef.current = '';
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [sdkConfig?.sttType, persoSession]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const link = document.createElement('a');
        link.href = audioUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `raon-voice-${timestamp}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        logger.log('🎙️ 녹음 파일 저장 완료:', link.download);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        URL.revokeObjectURL(audioUrl);
      };

      mediaRecorder.start();
      logger.log('🎙️ 녹음 시작');
    } catch (err) {
      logger.error('🎙️ 녹음 시작 실패:', err);
      setError('녹음을 시작할 수 없습니다: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      logger.log('🎙️ 녹음 종료');
    }
  };

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
        logger.log('🎤 음성 입력 시작 - 다시 클릭하면 종료됩니다');
        transcriptRef.current = '';
        setIsListening(true);

        await startRecording();
        recognitionRef.current.start();
      } else {
        logger.log('🎤 음성 입력 중지 (사용자 클릭)');
        recognitionRef.current.stop();
        stopRecording();
      }
    } catch (err) {
      logger.error('음성 입력 오류:', err);
      setError('음성 입력 중 오류가 발생했습니다: ' + err.message);
      setIsListening(false);
      transcriptRef.current = '';
      stopRecording();
    }
  };

  const endSession = async () => {
    if (persoSession) {
      try {
        const sessionId = sessionStorage.getItem('raon_session_id');
        persoSession.close();
        setPersoSession(null);
        setIsSessionActive(false);
        setMessages([]);
        if (sessionId) {
          const sessionKey = `raon_chat_messages_${sessionId}`;
          sessionStorage.removeItem(sessionKey);
        }
        sessionStorage.removeItem('raon_sdk_config');
        sessionStorage.removeItem('raon_session_id');
        prevChatLogLengthRef.current = 0;
        logger.log('🗑️ Chat history, SDK config, and session ID cleared');
        logger.log('✅ Chat Room ID maintained for conversation continuity');
      } catch (err) {
        logger.error('Session close error:', err);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="raon-wrapper">
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

        <div
          className="main-content"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 80px)'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxWidth: '500px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ marginBottom: '16px', color: '#333' }}>로그인이 필요합니다</h2>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
              AI 채팅 서비스를 이용하시려면 로그인이 필요합니다.<br />
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
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
            >
              홈페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="raon-wrapper">
      <div className="main-content">
        {/* 왼쪽 사이드바 */}
        <div className="left-sidebar">
          {/* 상태 */}
          <div className="status-item">
            <div className="status-label">상태</div>
            <div className="status-badge">
              <div 
                className="status-dot" 
                style={{
                  background: isSessionActive ? '#10b981' : '#fbbf24'
                }}
              />
              <div style={{ fontSize: '10px', color: isSessionActive ? '#059669' : '#d97706' }}>
                {isSessionActive ? '연결됨' : '대기중'}
              </div>
            </div>
          </div>

          {/* TTS */}
          <div className="tts-container">
            <div className="status-label">TTS</div>
            <label className="tts-switch">
              <input
                type="checkbox"
                checked={isTTSOn}
                onChange={() => setIsTTSOn(!isTTSOn)}
              />
              <span className="tts-slider"></span>
            </label>
          </div>

          <div className="sidebar-divider"></div>

          {/* 음성 녹음 버튼 - 이모지 변경 */}
          {sdkConfig?.sttType && (
            <button
              className="sidebar-icon-btn mic-btn"
              onClick={toggleVoiceInput}
              disabled={!isSessionActive}
              style={{
                background: isListening ? '#ef5350' : '#f3f4f6',
                color: isListening ? 'white' : '#374151',
                animation: isListening ? 'pulse-mic 1.5s infinite' : 'none'
              }}
              title={isListening ? '음성 입력 종료' : '음성 입력 시작'}
            >
              🎙️
            </button>
          )}

          {/* 채팅 버튼 */}
          <button
            className="sidebar-icon-btn chat-btn"
            onClick={toggleBar}
            title="채팅"
          >
            💬
          </button>

          <div style={{ flex: 1 }}></div>

          {/* 복원 버튼 */}
          {hasRestorableHistory && (
            <button
              className="sidebar-action-btn restore-btn"
              onClick={restoreChatHistory}
              title="이전 대화 복원"
            >
              <span>📋</span>
              <span>복원</span>
            </button>
          )}

          {/* 세션 종료 버튼 */}
          <button
            className="sidebar-action-btn end-btn"
            onClick={endSession}
            disabled={!isSessionActive}
            title="세션 종료"
          >
            <span style={{ fontSize: '9px' }}>세션</span>
            <span style={{ fontSize: '9px' }}>종료</span>
          </button>
        </div>

        {/* AI 모델 섹션 */}
        <div className="ai-model-section">
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

          {/* 채팅 시작 버튼 */}
          {!isSessionActive && !isLoading && sdkConfig && (
            <button
              className="start-session-btn"
              onClick={createSession}
              disabled={isLoading}
            >
              {isLoading ? '연결 중...' : '채팅 시작'}
            </button>
          )}

          {/* 통합 바 */}
          {isBarOpen && (
            <div className="unified-bar">
              <button 
                className={`mode-icon ${activeMode === 'search' ? 'active' : ''}`}
                onClick={switchToSearch}
                title="검색"
              >
                🔍
              </button>

              {activeMode === 'search' ? (
                <input
                  type="text"
                  className="unified-input"
                  placeholder="대화 내용 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchText);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  className="unified-input"
                  placeholder="메시지를 입력하세요..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  disabled={!isSessionActive}
                  autoFocus
                />
              )}

              <button 
                className={`mode-icon ${activeMode === 'chat' ? 'active' : ''}`}
                onClick={activeMode === 'chat' ? handleSendMessage : switchToChat}
                title={activeMode === 'chat' ? '전송' : '채팅'}
                disabled={activeMode === 'chat' && (!isSessionActive || !inputText.trim())}
              >
                {activeMode === 'chat' ? '➤' : '💬'}
              </button>

              <button 
                className="close-bar-btn"
                onClick={toggleBar}
                title="닫기"
              >
                ✕
              </button>

              {searchResults.length > 0 && activeMode === 'search' && (
                <div className="search-nav-controls">
                  <button onClick={goToPrevResult} className="search-nav-btn">▲</button>
                  <span className="search-count">
                    {currentSearchIndex + 1}/{searchResults.length}
                  </span>
                  <button onClick={goToNextResult} className="search-nav-btn">▼</button>
                </div>
              )}
            </div>
          )}

          {/* 채팅 메시지 */}
          {(isChatOpen || isSearchMode) && (
            <div className="floating-chat-container">
              <ChatMessages
                messages={messages}
                searchResults={searchResults}
                currentSearchIndex={currentSearchIndex}
                searchText={searchText}
              />
            </div>
          )}
        </div>
      </div>

      {/* 하단 상태바 */}
      <div className="bottom-status-bar">
        <span>마이크 권한 허용됨</span>
      </div>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isSessionActive={isSessionActive}
        onEndSession={endSession}
      />

      <ErrorNotification error={error} onClose={() => setError(null)} />
    </div>
  );
}

export default RaonChatPerso;