import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RaonAvatar.css';

const RaonAvatar = () => {
  const navigate = useNavigate();

  // 백오피스 설정 정보
  const [configurations, setConfigurations] = useState(null);
  const [loading, setLoading] = useState(true);

  // 모드/선택 상태
  const [selectedMode, setSelectedMode] = useState('preset'); // 'preset' | 'custom'
  const [selectedPreset, setSelectedPreset] = useState(null);

  // 프리셋 모드 단계
  const [presetStep, setPresetStep] = useState(1); // 1: 아바타 선택, 2: 배경 선택
  const [presetBackgroundImage, setPresetBackgroundImage] = useState(null);
  const [presetBackgroundPreview, setPresetBackgroundPreview] = useState(null);

  // 커스텀 모드 단계
  const [customStep, setCustomStep] = useState(1); // 1: 이름, 2: LLM, 3: TTS, 4: 배경
  const [customConfig, setCustomConfig] = useState({
    name: '',
    llm: '',
    tts: '',
    backgroundImage: null, // 파일 객체 또는 null
  });
  const [backgroundPreview, setBackgroundPreview] = useState(null);

  // 6개 프리셋 아바타 - 백엔드 설정 매핑 포함
  const presetAvatars = [
    {
      id: 1,
      name: '밝은 친구',
      personality: '항상 긍정적이고 밝은 에너지',
      description: '당신의 하루를 밝게 만들어줄 친구',
      image: '/avatars/chaehee.png',
      // 백엔드 설정
      llmType: 'azure-gpt-4o',
      ttsType: 'chaehee',
      modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
    },
    {
      id: 2,
      name: '차분한 조언자',
      personality: '신중하고 깊이 있는 대화',
      description: '고민을 함께 나누고 해결책을 찾아가요',
      image: '/avatars/curi.png',
      llmType: 'azure-gpt-4o',
      ttsType: 'yuri',
      modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
    },
    {
      id: 3,
      name: '열정적인 동기부여자',
      personality: '목표 달성을 응원하는 에너지',
      description: '당신의 꿈을 향한 여정을 함께 해요',
      image: '/avatars/eilee.png',
      llmType: 'azure-gpt-4o',
      ttsType: 'eilee',
      modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
    },
    {
      id: 4,
      name: '따뜻한 위로자',
      personality: '공감과 위로의 대화',
      description: '힘든 순간에 따뜻하게 안아줄게요',
      image: '/avatars/hns.png',
      llmType: 'azure-gpt-4o',
      ttsType: 'yuri',
      modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
    },
    {
      id: 5,
      name: '재미있는 친구',
      personality: '유머러스하고 즐거운 대화',
      description: '웃음과 재미를 선물할게요',
      image: '/avatars/yoori.png',
      llmType: 'azure-gpt-4o',
      ttsType: 'yuri',
      modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
    },
    {
      id: 6,
      name: '지적인 탐구자',
      personality: '호기심 많고 지식이 풍부',
      description: '흥미로운 주제를 함께 탐구해요',
      image: '/avatars/curi.png',
      llmType: 'azure-gpt-4o',
      ttsType: 'chaehee',
      modelStyle: 'chaehee_livechat-front-white_suit-natural_loop',
    },
  ];

  // 백오피스 API에서 설정 정보 가져오기
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/raon/api/backoffice/configurations?forceRefresh=true', {
          credentials: 'include',
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error(`설정 로드 실패: ${response.status}`);
        }

        const data = await response.json();
        setConfigurations(data);
      } catch (error) {
        console.error('설정 로드 실패:', error);
        alert('설정 정보를 불러오는데 실패했습니다. 기본 설정을 사용합니다.');
      } finally {
        setLoading(false);
      }
    };

    loadConfigurations();
  }, []);

  // SDK 연동용 옵션 - 백오피스 API에서 가져온 데이터 사용
  const llmModels = configurations?.llmModels?.map(model => ({
    id: model.name,
    name: model.name,
  })) || [
    { id: 'azure-gpt-4o', name: 'GPT-4' },
    { id: 'claude', name: 'Claude' },
    { id: 'gemini', name: 'Gemini' },
  ];

  const ttsOptions = configurations?.ttsModels?.map(model => ({
    id: model.name,
    name: model.name,
  })) || [
    { id: 'yuri', name: '여성 음성 1' },
    { id: 'chaehee', name: '여성 음성 2' },
    { id: 'male1', name: '남성 음성 1' },
    { id: 'male2', name: '남성 음성 2' },
  ];

  // ✅ 모드 전환(중복 제거, 초기화 포함)
  const handleModeSwitch = (mode) => {
    setSelectedMode(mode);
    if (mode === 'preset') {
      setPresetStep(1);
      setSelectedPreset(null);
      setPresetBackgroundImage(null);
      setPresetBackgroundPreview(null);
    } else {
      setCustomStep(1);
      setCustomConfig({ name: '', llm: '', tts: '', backgroundImage: null });
      setBackgroundPreview(null);
    }
  };

  // ✅ 프리셋 선택(중복 제거)
  const handlePresetSelect = (avatar) => {
    setSelectedPreset(avatar);
    setPresetStep(2); // 배경 선택 단계로 이동
  };

  // 커스텀 입력 변경
  const handleCustomChange = (field, value) => {
    setCustomConfig((prev) => ({ ...prev, [field]: value }));
  };

  // 커스텀 배경 업로드
  const handleBackgroundImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCustomConfig((prev) => ({ ...prev, backgroundImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setCustomConfig((prev) => ({ ...prev, backgroundImage: null }));
    setBackgroundPreview(null);
    const fileInput = document.getElementById('backgroundUpload');
    if (fileInput) fileInput.value = '';
  };

  const handleNextStep = () => {
    if (customStep < 4) setCustomStep(customStep + 1);
  };
  const handlePrevStep = () => {
    if (customStep > 1) setCustomStep(customStep - 1);
  };

  const canProceedToNextStep = () => {
    switch (customStep) {
      case 1:
        return customConfig.name.trim() !== '';
      case 2:
        return customConfig.llm !== '';
      case 3:
        return customConfig.tts !== '';
      case 4:
        return customConfig.backgroundImage !== null;
      default:
        return false;
    }
  };

  // 프리셋 배경 업로드/삭제
  const handlePresetBackgroundChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPresetBackgroundImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPresetBackgroundPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleRemovePresetBackground = () => {
    setPresetBackgroundImage(null);
    setPresetBackgroundPreview(null);
    const fileInput = document.getElementById('presetBackgroundUpload');
    if (fileInput) fileInput.value = '';
  };
  const handlePresetPrevStep = () => {
    setPresetStep(1);
    setPresetBackgroundImage(null);
    setPresetBackgroundPreview(null);
  };

  // 시작/취소 - SDK가 세션을 생성하도록 아바타 정보만 전달
  const handleStart = () => {
    if (selectedMode === 'preset' && selectedPreset) {
      // 프리셋 모드: 백엔드 설정 전달
      const firstPrompt = configurations?.prompts?.[0];
      console.log('🔍 All Prompts:', configurations?.prompts);
      console.log('🔍 First Prompt:', firstPrompt);
      console.log('🔍 Intro Message:', firstPrompt?.introMessage);

      navigate('/chat/new', {
        state: {
          avatarId: selectedPreset.id,
          avatarName: selectedPreset.name,
          personality: selectedPreset.personality,
          avatarImage: selectedPreset.image,
          backgroundImage: presetBackgroundPreview,
          mode: 'preset',
          // SDK가 세션 생성 시 사용할 설정
          sdkConfig: {
            promptId: firstPrompt?.promptId || 'plp-275c194ca6b8d746d6c25a0dec3c3fdb',
            introMessage: firstPrompt?.introMessage || '안녕하세요!',
            llmType: selectedPreset.llmType,
            ttsType: selectedPreset.ttsType,
            modelStyle: selectedPreset.modelStyle,
            documentId: configurations?.documents?.[0]?.documentId || null,
          },
        },
      });
    } else if (selectedMode === 'custom') {
      // 커스텀 모드: 사용자 선택 설정
      const firstPrompt = configurations?.prompts?.[0];
      console.log('🔍 All Prompts:', configurations?.prompts);
      console.log('🔍 First Prompt:', firstPrompt);
      console.log('🔍 Intro Message:', firstPrompt?.introMessage);

      navigate('/chat/new', {
        state: {
          avatarName: customConfig.name,
          backgroundImage: backgroundPreview,
          mode: 'custom',
          // SDK가 세션 생성 시 사용할 설정
          sdkConfig: {
            promptId: firstPrompt?.promptId || 'plp-275c194ca6b8d746d6c25a0dec3c3fdb',
            introMessage: firstPrompt?.introMessage || '안녕하세요!',
            llmType: customConfig.llm,
            ttsType: customConfig.tts,
            modelStyle: configurations?.modelStyles?.[0]?.name || 'chaehee_livechat-front-white_suit-natural_loop',
            documentId: configurations?.documents?.[0]?.documentId || null,
          },
        },
      });
    }
  };
  const handleCancel = () => navigate(-1);

  // 로딩 중 표시
  if (loading && !configurations) {
    return (
      <div className="avatar-selection-container">
        <div className="raon-header">
          <div className="raon-logo">RAON</div>
          <div className="raon-nav-menu">
            <button onClick={() => navigate('/chat-list')}>내 채팅방</button>
            <button className="active">새 채팅방</button>
            <button onClick={() => navigate('/summary')}>요약</button>
            <button onClick={() => navigate('/notes')}>노트</button>
            <button onClick={() => navigate('/menu')}>메뉴</button>
          </div>
        </div>
        <div className="avatar-selection-content" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>설정 정보를 불러오는 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-selection-container">
      {/* 헤더 */}
      <div className="raon-header">
        <div className="raon-logo">RAON</div>
        <div className="raon-nav-menu">
          <button onClick={() => navigate('/chat-list')}>내 채팅방</button>
          <button className="active">새 채팅방</button>
          <button onClick={() => navigate('/summary')}>요약</button>
          <button onClick={() => navigate('/notes')}>노트</button>
          <button onClick={() => navigate('/menu')}>메뉴</button>
        </div>
      </div>

      {/* 본문 */}
      <div className="avatar-selection-content">
        <h1 className="page-title">아바타 선택</h1>

        {/* 모드 탭 */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${selectedMode === 'preset' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('preset')}
          >
            ⭐ 프리셋 선택
          </button>
          <button
            className={`mode-tab ${selectedMode === 'custom' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('custom')}
          >
            🎨 직접 선택하기
          </button>
        </div>

        {/* 프리셋 모드 */}
        {selectedMode === 'preset' && (
          <div className="preset-mode active">
            {/* 1단계: 아바타 선택 */}
            {presetStep === 1 && (
              <>
                <p className="mode-description">
                  미리 설정된 아바타 중에서 선택하세요. 각 아바타는 최적화된 대화 스타일을 제공합니다.
                </p>

                <div className="preset-grid">
                  {presetAvatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`preset-card ${selectedPreset?.id === avatar.id ? 'selected' : ''}`}
                      onClick={() => handlePresetSelect(avatar)}
                    >
                      <div className="avatar-display">
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          onError={(e) => {
                            // 이미지 로드 실패 시 텍스트 표시
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="avatar-fallback">AI</span>
                      </div>
                      <h3 className="preset-name">{avatar.name}</h3>
                      <p className="preset-description">{avatar.personality}</p>
                      <p className="preset-detail">{avatar.description}</p>
                      {selectedPreset?.id === avatar.id && (
                        <div className="check-mark-container">
                          <span className="check-mark">✓ 선택됨</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 2단계: 배경 선택 */}
            {presetStep === 2 && selectedPreset && (
              <>
                <p className="mode-description">
                  <strong>{selectedPreset.name}</strong>와(과) 대화할 배경을 선택하세요.
                </p>

                <div className="step-section">
                  <h3 className="step-title">대화 배경을 선택하세요</h3>

                  <div className="background-section-wrapper">
                    {/* 왼쪽 업로드 영역 */}
                    <div className="left-upload-section">
                      <div className="upload-icon-header">🖼️</div>
                      <h4 className="upload-section-title">배경 이미지</h4>

                      <label htmlFor="presetBackgroundUpload" className="upload-label">
                        <div className="upload-box-new">
                          {presetBackgroundPreview ? (
                            <div
                              className="upload-box-preview"
                              style={{ backgroundImage: `url(${presetBackgroundPreview})` }}
                            >
                              <div className="upload-box-overlay">
                                <div className="folder-icon-small">📁</div>
                                <p className="upload-text-small">파일 변경</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="folder-icon-new">📁</div>
                              <p className="upload-text-new">파일 선택</p>
                              <p className="upload-subtext-new">선택된 파일 없음</p>
                            </>
                          )}
                        </div>
                      </label>

                      <input
                        type="file"
                        id="presetBackgroundUpload"
                        accept="image/*"
                        onChange={handlePresetBackgroundChange}
                        style={{ display: 'none' }}
                      />

                      {presetBackgroundImage && (
                        <div className="file-info-section">
                          <p className="file-name-new">{presetBackgroundImage.name}</p>
                          <button className="remove-file-btn" onClick={handleRemovePresetBackground} type="button">
                            삭제
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 오른쪽 미리보기 */}
                    <div className="right-preview-section">
                      <h4 className="preview-section-title">미리보기</h4>
                      <div className="large-preview-container">
                        {presetBackgroundPreview ? (
                          <div
                            className="background-preview-large"
                            style={{ backgroundImage: `url(${presetBackgroundPreview})` }}
                          ></div>
                        ) : (
                          <div className="preview-placeholder">
                            <p>이미지를 선택하면 여기에 미리보기가 표시됩니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn btn-secondary" onClick={handlePresetPrevStep}>
                    ← 이전
                  </button>
                  <button className="btn btn-primary" onClick={handleStart} disabled={!presetBackgroundImage}>
                    채팅 시작
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 커스텀 모드 */}
        {selectedMode === 'custom' && (
          <div className="custom-mode active">
            <p className="mode-description">단계별로 나만의 AI 친구를 만들어보세요.</p>

            {/* 단계 표시 */}
            <div className="step-indicator">
              <div className={`step ${customStep >= 1 ? 'active' : ''} ${customStep === 1 ? 'current' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">친구 이름</div>
              </div>
              <div className={`step ${customStep >= 2 ? 'active' : ''} ${customStep === 2 ? 'current' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">LLM 모델</div>
              </div>
              <div className={`step ${customStep >= 3 ? 'active' : ''} ${customStep === 3 ? 'current' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">TTS 음성</div>
              </div>
              <div className={`step ${customStep >= 4 ? 'active' : ''} ${customStep === 4 ? 'current' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">배경 이미지</div>
              </div>
            </div>

            {/* 단계별 컨텐츠 */}
            <div className="step-content">
              {customStep === 1 && (
                <div className="step-section">
                  <h3 className="step-title">AI 친구의 이름을 지어주세요</h3>
                  <div className="form-section-large">
                    <input
                      type="text"
                      className="input-large"
                      placeholder="예: 라온이, 친구야, 버디 등"
                      value={customConfig.name}
                      onChange={(e) => handleCustomChange('name', e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {customStep === 2 && (
                <div className="step-section">
                  <h3 className="step-title">사용할 LLM 모델을 선택하세요</h3>
                  <div className="selection-grid">
                    {llmModels.map((model) => (
                      <div
                        key={model.id}
                        className={`selection-card ${customConfig.llm === model.id ? 'selected' : ''}`}
                        onClick={() => handleCustomChange('llm', model.id)}
                      >
                        <div className="selection-icon">🤖</div>
                        <h4>{model.name}</h4>
                        {customConfig.llm === model.id && <div className="check-mark">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customStep === 3 && (
                <div className="step-section">
                  <h3 className="step-title">AI 친구의 음성을 선택하세요</h3>
                  <div className="selection-grid">
                    {ttsOptions.map((tts) => (
                      <div
                        key={tts.id}
                        className={`selection-card ${customConfig.tts === tts.id ? 'selected' : ''}`}
                        onClick={() => handleCustomChange('tts', tts.id)}
                      >
                        <div className="selection-icon">🎤</div>
                        <h4>{tts.name}</h4>
                        {customConfig.tts === tts.id && <div className="check-mark">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customStep === 4 && (
                <div className="step-section">
                  <h3 className="step-title">대화 배경을 선택하세요</h3>

                  <div className="background-section-wrapper">
                    {/* 왼쪽 업로드 */}
                    <div className="left-upload-section">
                      <div className="upload-icon-header">🖼️</div>
                      <h4 className="upload-section-title">배경 이미지</h4>

                      <label htmlFor="backgroundUpload" className="upload-label">
                        <div className="upload-box-new">
                          {backgroundPreview ? (
                            <div className="upload-box-preview" style={{ backgroundImage: `url(${backgroundPreview})` }}>
                              <div className="upload-box-overlay">
                                <div className="folder-icon-small">📁</div>
                                <p className="upload-text-small">파일 변경</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="folder-icon-new">📁</div>
                              <p className="upload-text-new">파일 선택</p>
                              <p className="upload-subtext-new">선택된 파일 없음</p>
                            </>
                          )}
                        </div>
                      </label>

                      <input
                        type="file"
                        id="backgroundUpload"
                        accept="image/*"
                        onChange={handleBackgroundImageChange}
                        style={{ display: 'none' }}
                      />

                      {customConfig.backgroundImage && (
                        <div className="file-info-section">
                          <p className="file-name-new">{customConfig.backgroundImage.name}</p>
                          <button className="remove-file-btn" onClick={handleRemoveBackground} type="button">
                            삭제
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 오른쪽 미리보기 */}
                    <div className="right-preview-section">
                      <h4 className="preview-section-title">미리보기</h4>
                      <div className="large-preview-container">
                        {backgroundPreview ? (
                          <div className="background-preview-large" style={{ backgroundImage: `url(${backgroundPreview})` }}></div>
                        ) : (
                          <div className="preview-placeholder">
                            <p>이미지를 선택하면 여기에 미리보기가 표시됩니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 커스텀 단계 네비게이션 */}
            <div className="step-navigation">
              <button className="btn btn-secondary" onClick={handlePrevStep} disabled={customStep === 1}>
                ← 이전
              </button>

              {customStep < 4 ? (
                <button className="btn btn-primary" onClick={handleNextStep} disabled={!canProceedToNextStep()}>
                  다음 →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleStart} disabled={!canProceedToNextStep()}>
                  채팅 시작
                </button>
              )}
            </div>
          </div>
        )}

        {/* ✅ 프리셋 모드 하단 버튼: 1단계일 때만 표시, '다음'으로 2단계 이동 */}
        {selectedMode === 'preset' && presetStep === 1 && (
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleCancel}>
              취소
            </button>
            <button className="btn btn-primary" onClick={() => setPresetStep(2)} disabled={!selectedPreset}>
              다음 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaonAvatar;