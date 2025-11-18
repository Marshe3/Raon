import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './RaonChat.css';
import { usePersoAI } from '../hooks/usePersoAI';

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
  const [isAiResponding, setIsAiResponding] = useState(false); // AI 응답 대기 중

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

  // 메시지 스크롤 ref
  const messagesEndRef = useRef(null);

  // 복원된 메시지 보관 (재연결 시 유지용)
  const restoredMessagesRef = useRef(null);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 변경 시 자동 저장 (재연결 시 복원용)
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('raon_chat_messages', JSON.stringify(messages));
      console.log('💾 Messages saved:', messages.length);
    }
  }, [messages]);

  // sdkConfig 저장 (재연결 시 복원용)
  useEffect(() => {
    if (sdkConfig) {
      sessionStorage.setItem('raon_sdk_config', JSON.stringify(sdkConfig));
      console.log('💾 SDK Config saved:', sdkConfig);
    }
  }, [sdkConfig]);

  // PersoAI SDK 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = PERSO_SDK_URL;
    script.async = true;
    script.onload = () => {
      console.log('PersoAI SDK loaded');
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

  // TTS ON/OFF 제어
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isTTSOn;

      // 오디오 트랙도 제어
      const audioTracks = videoRef.current.srcObject?.getAudioTracks() || [];
      audioTracks.forEach(track => {
        track.enabled = isTTSOn;
      });

      console.log(`🔊 TTS ${isTTSOn ? 'ON' : 'OFF'}`);
    }
  }, [isTTSOn]);


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
      console.log('=== Creating PersoAI Session via Backend ===');

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

      console.log('✓ Session Config:', { llmType, ttsType, modelStyle, promptId, documentId, backgroundImageId });

      // 백엔드 API로 세션 생성 요청
      const sttType = sdkConfig?.sttType || null;

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
        paddingHeight: 1
      };

      console.log('✓ STT Type:', sttType);

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
      console.log('✓ Session ID created via backend:', createdSessionId);

      // SDK로 WebRTC 세션 초기화
      // 참고: 음성 입력은 브라우저의 Web Speech API를 사용하므로 enableVoice는 false
      const session = await initializeSDKSession(createdSessionId, 1920, 1080, false);
      console.log('✓ WebRTC session created');
      if (sttType) {
        console.log('✓ STT enabled: 브라우저 음성 인식 사용 가능');
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
          console.warn('Video play warning:', err.message);
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
          console.log('📋 Keeping restored messages (empty server log)');
          return; // 복원된 메시지를 유지하고 종료
        }

        // timestamp 기준 오름차순 정렬 (오래된 메시지가 위, 최신 메시지가 아래)
        const sortedChatLog = [...chatLog].sort((a, b) => a.timestamp - b.timestamp);

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
          console.log('📡 New server messages received, clearing restored state');
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
        console.log('🔴 Session closed. Manual:', manualClosed);

        if (!manualClosed) {
          // 예기치 않은 종료 - 자동 재연결 시도
          console.log('🔄 Attempting auto-reconnect...');
          setError('세션이 종료되었습니다. 5초 후 자동으로 재연결합니다...');

          // 5초 후 자동 재연결
          setTimeout(() => {
            console.log('🔄 Auto-reconnecting...');
            setError(null);
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

      console.log('=== Session Setup Complete ===');
      console.log('📝 SDK Config:', sdkConfig);
      console.log('📝 Intro Message:', sdkConfig?.introMessage);

      // 저장된 채팅 기록 복원 (재연결 시)
      const savedMessages = sessionStorage.getItem('raon_chat_messages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          console.log('📥 Restoring saved messages:', parsedMessages.length);
          setMessages(parsedMessages);
          // 복원된 메시지를 ref에 보관 (subscribeChatLog에서 사용)
          restoredMessagesRef.current = parsedMessages;
        } catch (e) {
          console.error('❌ Failed to restore messages:', e);
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
      console.error('❌ Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송 (PersoAI SDK 사용)
  const handleSendMessage = () => {
    if (!inputText.trim() || !persoSession) return;

    const userMessage = inputText;
    setInputText('');

    // AI 응답 대기 상태 활성화
    setIsAiResponding(true);

    // SDK를 통해 메시지 전송
    persoSession.processChat(userMessage);
  };

  // Web Speech API 초기화
  useEffect(() => {
    if (!sdkConfig?.sttType) return;

    // 브라우저가 Web Speech API를 지원하는지 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('⚠️ 이 브라우저는 음성 인식을 지원하지 않습니다');
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
        console.log('🎤 음성 인식 결과 (확정):', finalTranscript);
        console.log('🎤 전체 누적 텍스트:', transcriptRef.current);
      }

      // 중간 결과도 로그에 표시
      if (interimTranscript) {
        console.log('🎤 음성 인식 중 (임시):', interimTranscript);
      }
    };

    // 음성 인식 종료 처리
    recognition.onend = () => {
      console.log('🎤 음성 인식 종료');

      // 녹음 중지 (자동으로 파일 저장됨)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // 누적된 텍스트가 있으면 전송
      const fullText = transcriptRef.current.trim();
      if (persoSession && fullText) {
        console.log('📤 최종 전송할 텍스트:', fullText);
        persoSession.processChat(fullText);
        transcriptRef.current = ''; // 초기화
      }

      setIsListening(false);
    };

    // 음성 인식 오류 처리
    recognition.onerror = (event) => {
      console.error('🎤 음성 인식 오류:', event.error);
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
          console.log('🎤 사용자가 음성 인식을 중지했습니다');
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

        console.log('🎙️ 녹음 파일 저장 완료:', link.download);

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
      console.log('🎙️ 녹음 시작');
    } catch (err) {
      console.error('🎙️ 녹음 시작 실패:', err);
      setError('녹음을 시작할 수 없습니다: ' + err.message);
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('🎙️ 녹음 종료');
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
        console.log('🎤 음성 입력 시작 - 다시 클릭하면 종료됩니다');
        transcriptRef.current = ''; // 누적 텍스트 초기화
        setIsListening(true);

        // 녹음 시작
        await startRecording();

        // 음성 인식 시작
        recognitionRef.current.start();
      } else {
        // 음성 입력 및 녹음 중지 - 사용자가 버튼을 다시 클릭
        console.log('🎤 음성 입력 중지 (사용자 클릭)');

        // 음성 인식 중지 (onend 이벤트가 호출되어 텍스트 전송)
        recognitionRef.current.stop();

        // 녹음 중지 (자동으로 파일 저장됨)
        stopRecording();
      }
    } catch (err) {
      console.error('음성 입력 오류:', err);
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
        persoSession.close();
        setPersoSession(null);
        setIsSessionActive(false);
        setMessages([]);
        // 수동 종료 시 저장된 채팅 기록 및 설정 정리
        sessionStorage.removeItem('raon_chat_messages');
        sessionStorage.removeItem('raon_sdk_config');
        console.log('🗑️ Chat history and SDK config cleared');
      } catch (err) {
        console.error('Session close error:', err);
      }
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
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
        <div className="ai-model-container">
          <div className="ai-display-box" style={{
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
            ...(backgroundImage && !isSessionActive ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {})
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isSessionActive ? 'block' : 'none'
              }}
            />
            {!isSessionActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: backgroundImage ? 'rgba(0, 0, 0, 0.3)' : 'transparent'
              }}>
                {!backgroundImage && (
                  <div style={{ fontSize: '80px', marginBottom: '20px' }}>AI</div>
                )}
                {avatarName && (
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '10px',
                    color: backgroundImage ? 'white' : 'inherit',
                    textShadow: backgroundImage ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                  }}>
                    {avatarName}
                  </div>
                )}
                {personality && (
                  <div style={{
                    fontSize: '14px',
                    marginBottom: '20px',
                    color: backgroundImage ? 'white' : '#666',
                    textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
                    {personality}
                  </div>
                )}
                <button
                  onClick={createSession}
                  disabled={isLoading || (!chatbotId && !sdkConfig) || !sdkLoaded}
                  style={{
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: isLoading || (!chatbotId && !sdkConfig) || !sdkLoaded ? 'not-allowed' : 'pointer',
                    opacity: isLoading || (!chatbotId && !sdkConfig) || !sdkLoaded ? 0.6 : 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  {isLoading ? '연결 중...' : '채팅 시작'}
                </button>
              </div>
            )}
          </div>
          <div className="ai-status-bar">
            <span className="status-label">상태:</span>
            <span className="status-indicator"></span>
            <span className="status-text">
              {isSessionActive ? '연결됨 🟢' : '대기 중'} | 마이크 권한 허용됨
            </span>
          </div>
        </div>

        {/* 오른쪽: 채팅 */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-${message.type}`}
              >
                <div className={`message-bubble-${message.type}`}>
                  {message.text}
                </div>
                <div className={`message-time-${message.type}`}>
                  {message.time}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-section">
            <div className="input-box">
              <input
                type="text"
                className="input-field"
                placeholder="메시지를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isSessionActive}
              />
              <span className="edit-icon">✏️</span>
            </div>
            {sdkConfig?.sttType && (
              <button
                className="mic-btn"
                onClick={toggleVoiceInput}
                disabled={!isSessionActive}
                style={{
                  padding: '12px 18px',
                  fontSize: '20px',
                  border: 'none',
                  borderRadius: '50%',
                  background: isListening ? '#e74c3c' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: !isSessionActive ? 'not-allowed' : 'pointer',
                  opacity: !isSessionActive ? 0.6 : 1,
                  marginRight: '8px',
                  transition: 'all 0.3s ease',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none'
                }}
                title={isListening ? '클릭하여 음성 입력 종료 및 전송' : '클릭하여 음성 입력 시작'}
              >
                🎤
              </button>
            )}
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!isSessionActive || !inputText.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* 메뉴 오버레이 */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {/* 사이드 메뉴 */}
      {isMenuOpen && (
        <div className="side-menu">
          <div className="menu-header-side">
            <h3>설정</h3>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
          </div>

          <div className="menu-section-side">
            <h4>TTS 음성</h4>
            <label className="switch">
              <input
                type="checkbox"
                checked={isTTSOn}
                onChange={() => setIsTTSOn(!isTTSOn)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {isSessionActive && (
            <div className="menu-section-side">
              <button
                onClick={endSession}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                세션 종료
              </button>
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#fee',
          color: '#c33',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#c33',
                fontSize: '20px',
                cursor: 'pointer',
                marginLeft: '15px'
              }}
            >×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaonChatPerso;
