import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, History, CheckCircle, Sparkles, Zap, Target } from 'lucide-react';
import './RaonHome.css';

function RaonHome() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* 히어로 섹션 */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            🎯 AI 기반 면접 준비 플랫폼
          </div>
          <h1 className="hero-title">
            완벽한 면접을 위한<br/>
            당신만의 AI 아바타 코치
          </h1>
          <p className="hero-description">
            실전과 같은 AI 면접관과의 연습부터 전문적인 서류 첨삭까지,<br/>
            RAON이 당신의 성공적인 면접을 함께합니다
          </p>
          <button 
            className="hero-button"
            onClick={() => navigate('/avatar')}
          >
            지금 시작하기 →
          </button>
        </div>
      </div>

      {/* 주요 기능 카드 */}
      <div className="service-cards">
        <ServiceCard
          icon={<MessageSquare className="service-icon" />}
          title="AI 면접 연습"
          description="6가지 직종별 맞춤 면접 시뮬레이션"
          features={["실시간 피드백", "음성 녹음 지원", "답변 간결성 분석"]}
          color="blue"
          badge="인기"
          onClick={() => navigate('/avatar')}
        />
        <ServiceCard
          icon={<FileText className="service-icon" />}
          title="이력서/자소서 작성"
          description="AI가 분석하는 이력서 & 자소서"
          features={["강점 분석", "개선 제안", "추천 문구"]}
          color="indigo"
          onClick={() => navigate('/resume')}
        />
        <ServiceCard
          icon={<History className="service-icon" />}
          title="학습 기록"
          description="나의 면접 연습 히스토리"
          features={["점수 확인", "다시보기", "성장 추적"]}
          color="purple"
          onClick={() => navigate('/Dashboard')}
        />
      </div>

      {/* 특징 섹션 */}
      <div className="features-section">
        <div className="features-header">
          <h2 className="features-title">왜 RAON을 선택해야 할까요?</h2>
          <p className="features-subtitle">AI 기술로 더 효과적인 면접 준비를 경험하세요</p>
        </div>

        <div className="features-grid">
          <FeatureBox
            icon={<Sparkles className="feature-icon" />}
            title="실전 같은 경험"
            description="실제 면접과 동일한 환경에서 AI 면접관과 연습하세요"
            color="yellow"
          />
          <FeatureBox
            icon={<Zap className="feature-icon" />}
            title="즉각적인 피드백"
            description="답변 후 바로 받는 AI의 분석과 개선 방안"
            color="orange"
          />
          <FeatureBox
            icon={<Target className="feature-icon" />}
            title="맞춤형 학습"
            description="직종별 특화된 질문과 평가 기준"
            color="green"
          />
        </div>
      </div>

      {/* CTA 섹션 - 이력서/자소서로 변경 */}
      <div className="cta-section">
        <h2 className="cta-title">완벽한 이력서와 자소서를 준비하세요</h2>
        <p className="cta-description">
          AI가 당신의 강점을 분석하고, 합격을 위한 최적의 문구를 제안합니다
        </p>
        <button 
          className="cta-button"
          onClick={() => navigate('/resume')}
        >
          이력서/자소서 작성하기
        </button>
      </div>
    </div>
  );
}

// 서비스 카드 컴포넌트
function ServiceCard({ icon, title, description, features, color, badge, onClick }) {
  return (
    <div
      className={`service-card service-card-${color}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      {badge && (
        <div className="service-badge">{badge}</div>
      )}
      
      <div className={`service-card-icon service-card-icon-${color}`}>
        {icon}
      </div>
      
      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-description">{description}</p>
      
      <ul className="service-features">
        {features.map((feature, idx) => (
          <li key={idx} className="service-feature-item">
            <CheckCircle className="feature-check-icon" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* ⬇️ 버튼에도 직접 연결(핵심 수정) */}
      <button
        type="button"
        className={`service-button service-button-${color}`}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        시작하기
      </button>
    </div>
  );
}

// 특징 박스 컴포넌트
function FeatureBox({ icon, title, description, color }) {
  return (
    <div className="feature-box">
      <div className={`feature-box-icon feature-box-icon-${color}`}>
        {icon}
      </div>
      <h3 className="feature-box-title">{title}</h3>
      <p className="feature-box-description">{description}</p>
    </div>
  );
}

export default RaonHome;
