import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RaonAvatar.css';
import { logger } from '../utils/logger';
import { fetchWithAuth } from '../utils/api';

const RaonAvatar = ({ user, isLoggedIn }) => {
  const navigate = useNavigate();

  // 로그인 체크
  useEffect(() => {
    if (!isLoggedIn) {
      logger.warn('⚠️ 로그인이 필요한 서비스입니다');
      const timer = setTimeout(() => {
        logger.log('🔄 홈페이지로 이동합니다');
        navigate('/');
      }, 5000); // ⬅️ 3초 → 5초로 변경
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  const [configurations, setConfigurations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [presetAvatars, setPresetAvatars] = useState([]);

  // 챗봇 목록 DB에서 가져오기
  useEffect(() => {
    const loadChatbots = async () => {
      try {
        const response = await fetchWithAuth('/raon/api/chatbots/public');
        if (!response.ok) throw new Error('챗봇 목록을 불러오는데 실패했습니다');
        const data = await response.json();

        const getIconForChatbot = (name) => {
          const nameLower = name.toLowerCase().replace(/\s/g, '');

          if (nameLower.includes('백엔드') || nameLower.includes('backend')) return '💻';
          if (nameLower.includes('게임') || nameLower.includes('game')) return '🎮';
          if (nameLower.includes('경찰') || nameLower.includes('police')) return '👮';
          if (nameLower.includes('치위생') || nameLower.includes('dental')) return '🦷';
          if (nameLower.includes('공기업') || nameLower.includes('public')) return '🏢';
          if (nameLower.includes('은행') || nameLower.includes('bank')) return '🏦';

          return '🤖';
        };

        const getDescriptionForChatbot = (name) => {
          const nameLower = name.toLowerCase().replace(/\s/g, '');

          if (nameLower.includes('백엔드') || nameLower.includes('backend')) {
            return '서버 개발 · API 설계\n데이터베이스 관리';
          }
          if (nameLower.includes('게임') || nameLower.includes('game')) {
            return '게임 엔진 · 그래픽스\n게임 로직 설계';
          }
          if (nameLower.includes('경찰') || nameLower.includes('police')) {
            return '인성 평가 · 상황 대처\n공직 가치관';
          }
          if (nameLower.includes('치위생') || nameLower.includes('dental')) {
            return '환자 관리 · 구강 보건\n실무 능력';
          }
          if (nameLower.includes('공기업') || nameLower.includes('public')) {
            return '공기업 적성 · 인성 면접\n직무 역량 평가';
          }
          if (nameLower.includes('은행') || nameLower.includes('bank')) {
            return '금융 지식 · 고객 서비스\n상황 대응 능력';
          }

          return 'AI 면접관과 함께\n실전 면접 연습';
        };

        const avatars = data.map((chatbot) => {
          const chatbotName = chatbot.chatbotName || chatbot.name || '면접관';

          return {
            id: chatbot.id,
            name: chatbotName,
            personality: chatbot.description || '친근한 대화 상대',
            description: getDescriptionForChatbot(chatbotName),
            icon: getIconForChatbot(chatbotName),
            llmType: chatbot.llmType,
            ttsType: chatbot.ttsType,
            sttType: chatbot.sttType,
            modelStyle: chatbot.modelStyle,
            promptId: chatbot.promptId,
            documentId: chatbot.documentId,
          };
        });

        setPresetAvatars(avatars);
        logger.log('✅ 챗봇 목록 로드 완료:', avatars);
      } catch (error) {
        logger.error('❌ 챗봇 목록 로드 실패:', error);
      }
    };
    loadChatbots();
  }, []);

  // 백오피스 설정 로드
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth('/raon/api/backoffice/configurations?forceRefresh=true', {
          cache: 'no-cache',
        });
        if (!response.ok) throw new Error(`설정 로드 실패: ${response.status}`);
        const data = await response.json();
        setConfigurations(data);
      } catch (error) {
        logger.error('설정 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfigurations();
  }, []);

  // 프리셋 선택 - 바로 채팅방으로 이동
  const handlePresetSelect = (avatar) => {
    const selectedPrompt =
      configurations?.prompts?.find((p) => p.promptId === avatar.promptId) ||
      configurations?.prompts?.[0];

    navigate(`/chat/${avatar.id}`, {
      state: {
        avatarId: avatar.id,
        avatarName: avatar.name,
        personality: avatar.personality,
        avatarIcon: avatar.icon,
        backgroundImage: null,
        mode: 'preset',
        sdkConfig: {
          promptId: avatar.promptId,
          documentId: avatar.documentId,
          llmType: avatar.llmType,
          ttsType: avatar.ttsType,
          sttType: avatar.sttType || null,
          modelStyle: avatar.modelStyle,
          introMessage: selectedPrompt?.introMessage || '안녕하세요!',
        },
      },
    });
  };

  if (loading && !configurations) {
    return (
      <div className="avatar-selection-container">
        <div
          className="avatar-selection-content"
          style={{ textAlign: 'center', paddingTop: '100px' }}
        >
          <h2>설정 정보를 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  // ✅ 로그인 안 된 상태 화면 (보라 배경 전체 너비)
  if (!isLoggedIn) {
    return (
      <div className="avatar-login-required">
        <div className="avatar-login-card">
          <div className="avatar-login-icon">🔒</div>
          <h2 className="avatar-login-title">로그인이 필요합니다</h2>
          <p className="avatar-login-text">
            아바타 선택 서비스를 이용하시려면 로그인이 필요합니다.
          </p>
          <button
            className="avatar-login-button"
            onClick={() => navigate('/')}
          >
            홈페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-selection-container">
      <div className="avatar-selection-content">
        <div className="title-section">
          <h1 className="avatar-page-title">
            <span className="raon-highlight">RAON</span> 면접관 선택
          </h1>
          <p className="avatar-page-subtitle">
            각 분야의 전문 면접관이 당신의 면접을 도와드립니다
          </p>
        </div>

        <div className="preset-grid">
          {presetAvatars.map((avatar) => (
            <div
              key={avatar.id}
              className="preset-card"
              onClick={() => handlePresetSelect(avatar)}
            >
              <div className="avatar-icon-circle">
                <span className="avatar-icon-emoji">{avatar.icon}</span>
              </div>
              <h3 className="preset-name">{avatar.name}</h3>
              <p className="preset-description">
                {avatar.description.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < avatar.description.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaonAvatar;
