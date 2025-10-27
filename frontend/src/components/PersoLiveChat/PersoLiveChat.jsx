import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveAs } from 'file-saver';
import WavRecorder from './wav-recorder';
import './PersoLiveChat.css';

const PersoLiveChat = () => {
  // State 관리
  const [apiServer, setApiServer] = useState(''); // 백엔드에서 받아온 API Server 주소
  const [apiKey, setApiKey] = useState(''); // 백엔드에서 받아온 API Key
  const [config, setConfig] = useState(null);
  const [session, setSession] = useState(null);
  const [recording, setRecording] = useState(false);
  const [chatState, setChatState] = useState(0); // 0: available 1: recording 2: analyzing 3: AI speaking
  const [sessionState, setSessionState] = useState(0); // 0: Initial 1: starting 2: started
  const [screenOrientation, setScreenOrientation] = useState('portrait');
  const [chatbotLeft, setChatbotLeft] = useState(0);
  const [chatbotTop, setChatbotTop] = useState(0);
  const [chatbotHeight, setChatbotHeight] = useState(100);
  const [enableVoiceChat, setEnableVoiceChat] = useState(true);
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState('');
  const [ttfMessage, setTtfMessage] = useState('');
  const [useIntro, setUseIntro] = useState(false);
  const [introMessage, setIntroMessage] = useState('');

  // Select options state
  const [selectedLlm, setSelectedLlm] = useState(0);
  const [selectedTts, setSelectedTts] = useState(0);
  const [selectedChatbotStyle, setSelectedChatbotStyle] = useState(0);
  const [selectedBackground, setSelectedBackground] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState('');

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const chatLogRef = useRef(null);  // 채팅 로그 컨테이너 ref
  const backgroundImgRef = useRef(new Image());
  const persoImgRef = useRef(new Image());
  const removeOnCloseRef = useRef(null);
  const unsubscribeChatStatusRef = useRef(null);
  const unsubscribeChatLogRef = useRef(null);
  const unsubscribeStfStartEventRef = useRef(null);
  const removeSttResultCallbackRef = useRef(null);

  // Canvas 그리기 함수 - useCallback으로 메모이제이션
  const redrawChatbotCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width, height;
    if (screenOrientation === 'portrait') {
      width = 304;
      height = 540;
    } else {
      width = 960;
      height = 540;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(backgroundImgRef.current, 0, 0, width, height);

    const perso = persoImgRef.current;
    let persoRatio = perso.width / perso.height;
    let persoWidth = height * persoRatio;
    let persoHeight = height;
    persoWidth = Math.min((persoWidth * (chatbotHeight / 100)), width);
    persoHeight = persoWidth / persoRatio;

    let leftRange = width - persoWidth;
    let persoLeft = leftRange * (chatbotLeft / 200 + 0.5);
    let persoTop = height * (chatbotTop / 100);

    ctx.drawImage(perso, persoLeft, persoTop, persoWidth, persoHeight);
  }, [screenOrientation, chatbotLeft, chatbotTop, chatbotHeight]);

  // 이미지 로드
  useEffect(() => {
    const loadImages = async () => {
      await new Promise((resolve) => {
        backgroundImgRef.current.src = '/background.png';
        backgroundImgRef.current.onload = resolve;
      });
      await new Promise((resolve) => {
        persoImgRef.current.src = '/perso.png';
        persoImgRef.current.onload = resolve;
      });
      redrawChatbotCanvas();
    };
    loadImages();
  }, [redrawChatbotCanvas]);

  // Canvas 그리기
  useEffect(() => {
    redrawChatbotCanvas();
  }, [redrawChatbotCanvas]);

  // 채팅 로그 자동 스크롤
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  // API 인증 및 설정 가져오기
  const getConfig = async () => {
    try {
      console.log('백엔드에서 API 자격증명 로드 중...');

      // 1. 백엔드에서 API 자격증명 가져오기
      const credResponse = await fetch('/raon/api/persoai/credentials');

      if (!credResponse.ok) {
        throw new Error(`백엔드 에러! status: ${credResponse.status}`);
      }

      const credentials = await credResponse.json();
      console.log('자격증명 수신:', { apiServer: credentials.apiServer });

      // 자격증명 저장
      setApiServer(credentials.apiServer);
      setApiKey(credentials.apiKey);

      // 2. PersoLive SDK로 직접 설정 정보 가져오기
      console.log('PersoLive SDK로 설정 로드 중...');
      const configData = await window.PersoLiveSDK.getAllSettings(
        credentials.apiServer,
        credentials.apiKey
      );

      console.log('설정 로드 성공:', configData);
      setConfig(configData);

      if (configData.prompts && configData.prompts.length > 0) {
        setIntroMessage(configData.prompts[0].intro_message);
      }

      alert('✅ 설정 로드 성공!');
    } catch (e) {
      console.error('설정 로드 에러:', e);

      let errorMessage = '❌ 설정 로드 실패\n\n';
      errorMessage += '에러 내용:\n' + e.message + '\n\n';

      if (e.message.includes('백엔드')) {
        errorMessage += '백엔드 서버가 실행 중인지 확인하세요.';
      } else {
        errorMessage += 'PersoAI API 호출에 실패했습니다.\n';
        errorMessage += 'F12 → Network 탭에서 상세 내용을 확인하세요.';
      }

      alert(errorMessage);
    }
  };

  // 세션 시작
  const startSession = async () => {
    // 이전 구독 정리
    if (removeOnCloseRef.current) removeOnCloseRef.current();
    if (unsubscribeChatStatusRef.current) unsubscribeChatStatusRef.current();
    if (unsubscribeChatLogRef.current) unsubscribeChatLogRef.current();
    if (unsubscribeStfStartEventRef.current) unsubscribeStfStartEventRef.current();
    if (removeSttResultCallbackRef.current) removeSttResultCallbackRef.current();

    let width, height;
    if (screenOrientation === 'portrait') {
      width = 1080;
      height = 1920;
    } else {
      width = 1920;
      height = 1080;
    }

    const llmOption = config.llms[selectedLlm];
    const ttsOption = config.ttsTypes[selectedTts];
    const modelStyleOption = config.modelStyles[selectedChatbotStyle];
    const promptOption = config.prompts[selectedPrompt];

    let backgroundImageKey = null;
    if (selectedBackground !== '') {
      backgroundImageKey = config.backgroundImages[parseInt(selectedBackground)].backgroundimage_id;
    }

    let documentKey = null;
    if (selectedDocument !== '') {
      documentKey = config.documents[parseInt(selectedDocument)].document_id;
    }

    try {
      setSessionState(1); // Starting

      // PersoLive SDK로 세션 ID 생성 (자격증명 사용)
      const sessionId = await window.PersoLiveSDK.createSessionId(
        apiServer,
        apiKey,
        llmOption.name,
        ttsOption.name,
        modelStyleOption.name,
        promptOption.prompt_id,
        documentKey,
        backgroundImageKey,
        chatbotLeft / 100,
        chatbotTop / 100,
        chatbotHeight / 100
      );

      // PersoLive SDK로 세션 생성
      const newSession = await window.PersoLiveSDK.createSession(
        apiServer,
        sessionId,
        width,
        height,
        enableVoiceChat
      );

      // 세션 상태를 먼저 변경하여 video 요소 렌더링
      setSession(newSession);
      setSessionState(2); // Started
      
      // video 요소가 렌더링될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // video 요소가 준비되었는지 확인
      if (videoRef.current) {
        newSession.setSrc(videoRef.current);
      } else {
        throw new Error('Video 요소를 찾을 수 없습니다.');
      }

      // 채팅 상태 구독
      unsubscribeChatStatusRef.current = newSession.subscribeChatStatus((status) => {
        // status는 숫자: 0=available, 1=recording, 2=analyzing, 3=AI speaking
        setChatState(status);
        if (status === 0 || status === 2) {
          setRecording(false);
        }
      });

      // 채팅 로그 구독
      unsubscribeChatLogRef.current = newSession.subscribeChatLog((logs) => {
        setChatLog(logs);
      });

      // STF 이벤트 구독 (선택적)
      if (typeof newSession.subscribeStfStartEvent === 'function') {
        unsubscribeStfStartEventRef.current = newSession.subscribeStfStartEvent(() => {
          setChatState(3);
        });
      }

      // STT 결과 콜백 (선택적)
      if (typeof newSession.addSttResultCallback === 'function') {
        removeSttResultCallbackRef.current = newSession.addSttResultCallback((result) => {
          console.log('STT Result:', result);
        });
      }

      // 세션 종료 이벤트
      if (typeof newSession.onClose === 'function') {
        removeOnCloseRef.current = newSession.onClose((manualClosed) => {
          if (!manualClosed) {
            console.log('세션이 자동으로 종료되었습니다.');
          }
          setSessionState(0);
          setChatState(0);
        });
      }

      // 초기 채팅 상태 설정
      setChatState(0);

      // Intro 메시지 전송
      if (useIntro && introMessage && introMessage.trim().length > 0) {
        setTimeout(() => {
          if (typeof newSession.intro === 'function') {
            newSession.intro();
          } else {
            newSession.processChat(introMessage);
          }
        }, 1000);
      }
    } catch (e) {
      console.error('세션 시작 에러:', e);
      alert('세션 시작 실패: ' + e.message);
      setSessionState(0);
    }
  };

  // 세션 종료
  const stopSession = () => {
    if (session) {
      session.stopSession();
      setSession(null);
      setSessionState(0);
      setChatState(0);
    }
  };

  // 세션 버튼 클릭
  const onSessionClicked = () => {
    if (sessionState === 0) {
      startSession();
    } else if (sessionState === 2) {
      stopSession();
    }
  };

  // 메시지 전송
  const sendMessage = () => {
    if (session && message.trim()) {
      session.processChat(message.trim());
      setMessage('');
    }
  };

  // 음성 중지
  const stopSpeech = () => {
    if (session && chatState === 3) {
      session.clearBuffer();
    }
  };

  // 버튼 클릭 핸들러
  const onSendMessageClicked = () => {
    if (chatState === 3) {
      stopSpeech();
    } else {
      sendMessage();
    }
  };

  // Enter 키 처리
  const onMessageKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // 음성 채팅 시작/종료
  const onVoiceChatClicked = () => {
    if (!session) return;

    const canRecord = !recording && chatState === 0;
    
    if (canRecord) {
      session.startVoiceChat();
      setRecording(true);
    } else {
      session.stopVoiceChat();
      setRecording(false);
    }
  };

  // TTS-TF (Text to Speech - Text Format) 메시지 전송
  const onTtfMessageSubmit = () => {
    if (session && ttfMessage.trim()) {
      session.processTTSTF(ttfMessage.trim());
      setTtfMessage('');
    }
  };

  // STF (Speech to Face) 파일 업로드
  const onStfFileChanged = (e) => {
    const file = e.target.files[0];
    if (!file || !session) return;

    const isMp3 = file.name.endsWith('mp3');
    const isWav = file.name.endsWith('wav');
    
    if (isMp3) {
      session.processSTF(file, 'mp3', '');
    } else if (isWav) {
      session.processSTF(file, 'wav', '');
    }
  };

  // 음성 녹음 시작/종료
  const onRecordVoiceClicked = async () => {
    const canRecord = !recording && chatState === 0;

    if (canRecord) {
      try {
        // SDK의 로컬 스트림 사용
        if (session && typeof session.getLocalStream === 'function') {
          const localStream = session.getLocalStream();
          recorderRef.current = new WavRecorder(localStream);
          recorderRef.current.start();
          setRecording(true);
        } else {
          // 폴백: 직접 마이크 접근
          const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          recorderRef.current = new WavRecorder(mediaStream);
          recorderRef.current.start();
          setRecording(true);
        }
      } catch (e) {
        alert('마이크 접근 실패: ' + e.message);
      }
    } else {
      if (recorderRef.current) {
        const wavFile = await recorderRef.current.stop();
        saveAs(wavFile, 'recording.wav');
        recorderRef.current = null;
        setRecording(false);
      }
    }
  };

  // Prompt 변경 핸들러
  const handlePromptChange = (index) => {
    setSelectedPrompt(index);
    if (config && config.prompts[index]) {
      setIntroMessage(config.prompts[index].intro_message);
    }
  };

  // 채팅 상태 텍스트
  const getChatStateText = () => {
    switch (chatState) {
      case 0: return 'Available';
      case 1: return 'Recording';
      case 2: return 'Analyzing';
      case 3: return 'AI Speaking';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ display: 'block', paddingLeft: '47px' }}>
      <p className="title">Perso AI Live Chat SDK demo</p>
      
      {sessionState === 0 && (
        <div id="configContainer" style={{ display: 'block' }}>
          <p className="config-title">Live Chat configuration</p>
          <div className="config">
            {/* 설정 로드 버튼 */}
            {!config && (
              <div style={{ marginTop: '16px' }}>
                <p className="configuration">설정 로드하기</p>
                <button
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                  onClick={getConfig}
                >
                  설정 불러오기
                </button>
              </div>
            )}

            {config && (
              <>
                {/* 1. LLM */}
                <p className="configuration" style={{ marginTop: '36px' }}>1. LLM</p>
                <select
                  value={selectedLlm}
                  onChange={(e) => setSelectedLlm(parseInt(e.target.value))}
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                >
                  {config.llms.map((llm, index) => (
                    <option key={index} value={index}>{llm.name}</option>
                  ))}
                </select>

                {/* 2. TTS */}
                <p className="configuration" style={{ marginTop: '36px' }}>2. TTS</p>
                <select
                  value={selectedTts}
                  onChange={(e) => setSelectedTts(parseInt(e.target.value))}
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                >
                  {config.ttsTypes.map((tts, index) => (
                    <option key={index} value={index}>{tts.name}</option>
                  ))}
                </select>

                {/* 3. AI human style */}
                <p className="configuration" style={{ marginTop: '36px' }}>3. AI human style</p>
                <select
                  value={selectedChatbotStyle}
                  onChange={(e) => setSelectedChatbotStyle(parseInt(e.target.value))}
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                >
                  {config.modelStyles.map((style, index) => (
                    <option key={index} value={index}>{style.name}</option>
                  ))}
                </select>

                {/* 4. Background */}
                <p className="configuration" style={{ marginTop: '36px' }}>4. Background</p>
                <select
                  value={selectedBackground}
                  onChange={(e) => setSelectedBackground(e.target.value)}
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                >
                  <option value="">None</option>
                  {config.backgroundImages.map((bg, index) => (
                    <option key={index} value={index}>{bg.title}</option>
                  ))}
                </select>

                {/* 5. Prompt */}
                <p className="configuration" style={{ marginTop: '36px' }}>5. Prompt</p>
                <select
                  value={selectedPrompt}
                  onChange={(e) => handlePromptChange(parseInt(e.target.value))}
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                >
                  {config.prompts.map((prompt, index) => (
                    <option key={index} value={index}>{prompt.name}</option>
                  ))}
                </select>

                {/* 6. Intro message */}
                <p className="configuration" style={{ marginTop: '36px' }}>6. Intro message</p>
                <label className="intro" style={{ marginTop: '20px', marginLeft: '18px' }}>
                  {introMessage}
                </label>
                <div style={{ display: 'flex', marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    checked={useIntro}
                    onChange={(e) => setUseIntro(e.target.checked)}
                    style={{ marginLeft: '18px' }}
                  />
                  <label>Use intro</label>
                </div>

                {/* 9. Document */}
                <p className="configuration" style={{ marginTop: '36px' }}>9. Document</p>
                <select
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  style={{ marginTop: '20px', marginLeft: '18px' }}
                >
                  <option value="">None</option>
                  {config.documents.map((doc, index) => (
                    <option key={index} value={index}>{doc.title}</option>
                  ))}
                </select>
              </>
            )}

            {/* 10. Screen orientation */}
            <p className="configuration" style={{ marginTop: '36px' }}>10. Screen orientation</p>
            <div style={{ display: 'flex', marginTop: '24px', marginBottom: '43px' }}>
              <input
                type="radio"
                name="screenOrientation"
                value="portrait"
                checked={screenOrientation === 'portrait'}
                onChange={(e) => setScreenOrientation(e.target.value)}
                style={{ marginLeft: '18px' }}
              />
              <label>PORTRAIT</label>
              <input
                type="radio"
                name="screenOrientation"
                value="landscape"
                checked={screenOrientation === 'landscape'}
                onChange={(e) => setScreenOrientation(e.target.value)}
                style={{ marginLeft: '32px' }}
              />
              <label>LANDSCAPE</label>
            </div>

            {/* 11. Chatbot position */}
            <p className="configuration" style={{ marginTop: '36px' }}>11. Chatbot position</p>
            <div style={{ display: 'block', marginTop: '24px', marginBottom: '43px' }}>
              <canvas
                ref={canvasRef}
                className="chatbot-position"
                style={{ marginLeft: '18px' }}
              />
              <div style={{ marginLeft: '18px', marginTop: '24px' }}>
                <p>CHATBOT LEFT : {chatbotLeft}({(chatbotLeft / 100).toFixed(2)})</p>
                <input
                  type="range"
                  className="range"
                  min="-100"
                  max="100"
                  value={chatbotLeft}
                  onChange={(e) => setChatbotLeft(parseInt(e.target.value))}
                />
                <p>CHATBOT TOP : {chatbotTop}({(chatbotTop / 100).toFixed(2)})</p>
                <input
                  type="range"
                  className="range"
                  min="0"
                  max="100"
                  value={chatbotTop}
                  onChange={(e) => setChatbotTop(parseInt(e.target.value))}
                />
                <p>CHATBOT HEIGHT : {chatbotHeight}({(chatbotHeight / 100).toFixed(2)})</p>
                <input
                  type="range"
                  className="range"
                  min="0"
                  max="500"
                  value={chatbotHeight}
                  onChange={(e) => setChatbotHeight(parseInt(e.target.value))}
                />
                <p># The position and size of the chatbot may appear differently depending on the 'BACKGROUND' and 'AI HUMAN STYLE'.</p>
              </div>
            </div>

            {/* 12. Etc */}
            <p className="configuration" style={{ marginTop: '36px' }}>12. Etc</p>
            <div style={{ display: 'flex', marginTop: '24px', marginBottom: '43px' }}>
              <input
                type="checkbox"
                checked={enableVoiceChat}
                onChange={(e) => setEnableVoiceChat(e.target.checked)}
                style={{ marginLeft: '18px' }}
              />
              <label>Enable voice chat (If checked, microphone permission will be requested)</label>
            </div>
          </div>

          <button
            className="session"
            onClick={onSessionClicked}
            disabled={sessionState === 1}
          >
            START
          </button>
        </div>
      )}

      {sessionState === 2 && (
        <>
          <div style={{ display: 'flex', marginTop: '84px' }}>
            <video
              ref={videoRef}
              className={screenOrientation}
              autoPlay
              playsInline
            />
            <ul className="chat-log" ref={chatLogRef}>
              {chatLog.map((chat, index) => {
                // timestamp를 안전하게 문자열로 변환
                let timestampStr = '';
                if (chat.timestamp) {
                  if (chat.timestamp instanceof Date) {
                    timestampStr = chat.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });
                  } else if (typeof chat.timestamp === 'string') {
                    timestampStr = chat.timestamp;
                  } else if (typeof chat.timestamp === 'object') {
                    // 객체인 경우 JSON.stringify 또는 toString
                    try {
                      timestampStr = JSON.stringify(chat.timestamp);
                    } catch {
                      timestampStr = String(chat.timestamp);
                    }
                  } else {
                    timestampStr = String(chat.timestamp);
                  }
                }
                
                return (
                  <li
                    key={`chat-${index}-${Date.now()}`}
                    className={`message-container ${chat.isUser ? 'user' : 'other'}`}
                  >
                    <span className="timestamp">{timestampStr}</span>
                    <div className={`message ${chat.isUser ? 'user-message' : 'other-message'}`}>
                      {typeof chat.text === 'string' ? chat.text : String(chat.text)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Chat State */}
          <div className="input-method-container">
            <p style={{ width: '150px', marginLeft: '14px', fontSize: '24px', lineHeight: '28px' }}>
              Chat state :
            </p>
            <p style={{ width: '697px', marginLeft: '14px', fontSize: '24px', lineHeight: '28px' }}>
              {getChatStateText()}
            </p>
            <button
              style={{ width: '133px', height: '72px', fontSize: '24px', marginLeft: '12px' }}
              disabled={chatState !== 3}
              onClick={stopSpeech}
            >
              Stop Speech
            </button>
          </div>

          {/* Text Input */}
          <div className="input-method-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={onMessageKeyPress}
              disabled={chatState !== 0}
              style={{ width: '863px', height: '72px', fontSize: '24px', paddingInline: '10px', marginLeft: '12px' }}
            />
            <button
              style={{ width: '133px', height: '72px', fontSize: '24px', marginLeft: '12px' }}
              onClick={onSendMessageClicked}
              disabled={chatState !== 0 && chatState !== 3}
            >
              {chatState === 3 ? 'Stop' : 'Send'}
            </button>
          </div>

          {/* Voice Chat */}
          {enableVoiceChat && (
            <div className="input-method-container">
              <p style={{ width: '150px', marginLeft: '14px', fontSize: '24px', lineHeight: '28px' }}>
                Voice chat
              </p>
              <button
                style={{ width: '128px', height: '52px', marginLeft: '14px', fontSize: '24px' }}
                onClick={onVoiceChatClicked}
                disabled={chatState === 2 || chatState === 3}
              >
                {recording ? 'Stop' : 'Start'}
              </button>
            </div>
          )}

          {/* TTS-TF */}
          <div className="input-method-container">
            <p style={{ width: '300px', marginLeft: '14px', fontSize: '24px', lineHeight: '28px' }}>
              Make the chatbot speak using text
            </p>
            <input
              type="text"
              value={ttfMessage}
              onChange={(e) => setTtfMessage(e.target.value)}
              disabled={chatState !== 0}
              style={{ width: '543px', height: '72px', fontSize: '24px', paddingInline: '10px', marginLeft: '18px' }}
            />
            <button
              style={{ width: '133px', height: '72px', fontSize: '24px', marginLeft: '12px' }}
              onClick={onTtfMessageSubmit}
              disabled={chatState !== 0}
            >
              Send
            </button>
          </div>

          {/* STF File Upload */}
          <div className="input-method-container">
            <p style={{ width: '300px', marginLeft: '14px', fontSize: '24px', lineHeight: '28px' }}>
              Make the chatbot speak using audio(Experimental)
            </p>
            <input
              type="file"
              accept="audio/wav, audio/mp3"
              onChange={onStfFileChanged}
              onClick={(e) => e.target.value = null}
              style={{ marginLeft: '14px' }}
            />
          </div>

          {/* Record Voice */}
          {enableVoiceChat && (
            <div className="input-method-container">
              <p style={{ marginLeft: '14px', fontSize: '24px', lineHeight: '28px' }}>
                Record user voice
              </p>
              <button
                style={{ width: '128px', height: '52px', marginLeft: '14px', fontSize: '24px' }}
                onClick={onRecordVoiceClicked}
              >
                {recording ? 'Stop' : 'Record'}
              </button>
            </div>
          )}

          <button
            className="session"
            onClick={onSessionClicked}
            style={{ marginTop: '24px' }}
          >
            STOP
          </button>
        </>
      )}
    </div>
  );
};

export default PersoLiveChat;