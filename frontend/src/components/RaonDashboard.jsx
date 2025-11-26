import React, { useMemo, useState } from "react";
import "./RaonDashboard.css";

const DEFAULT_ROLES = [
  { key: "backend", name: "백엔드 면접관", icon: "💻" },
  { key: "police", name: "경찰 공무원 면접관", icon: "👮" },
  { key: "dentist", name: "치위생사 면접관", icon: "🦷" },
  { key: "game", name: "게임 개발자 면접관", icon: "🎮" },
  { key: "public", name: "공기업 면접관", icon: "🏢" },
  { key: "bank", name: "은행 면접관", icon: "🏦" },
];

// 데모 데이터
const DEMO_DATA = {
  backend: {
    name: "백엔드 개발자",
    icon: "💻",
    subtitle: "API 설계 · 데이터베이스 · 서버 개발",
    stats: { interviews: 24, hours: "18h", score: 85, improvement: "92%" },
    dimensions: { fit: 85, spec: 82, logic: 87, sincerity: 84, material: 81 },
    skills: [
      { icon: "⚙️", name: "Spring Boot", score: 88, desc: "Spring Framework를 활용한 백엔드 개발 능력이 우수하며 RESTful API 설계에 능숙합니다." },
      { icon: "🔌", name: "RESTful API", score: 85, desc: "HTTP 메서드를 적절히 활용하고 명확한 엔드포인트 설계 능력을 보여줍니다." },
      { icon: "🗄️", name: "데이터베이스 MySQL", score: 82, desc: "데이터베이스 설계와 쿼리 최적화에 대한 이해도가 높고 정규화를 잘 적용합니다." },
      { icon: "🔐", name: "보안 & 인증 JWT/OAuth2", score: 79, desc: "인증 및 인가 시스템 구현 능력이 있으며 보안에 대한 관심이 높습니다." },
      { icon: "⚡", name: "성능 최적화", score: 76, desc: "병목 구간 분석과 캐싱 전략을 통한 성능 개선에 노력하고 있습니다." },
      { icon: "🐛", name: "테스트 & 디버깅", score: 80, desc: "체계적인 테스트 작성과 효율적인 디버깅으로 코드 품질을 관리합니다." }
    ],
    analysis: [
      { label: "적합성", score: 85, desc: "백엔드 개발자로서 필요한 기술적 역량과 문제 해결 능력을 질문에 맞춰 효과적으로 전달합니다. API 설계, 데이터베이스 최적화 등 핵심 주제에 대한 이해도가 높으며, 실무 경험을 바탕으로 한 답변이 설득력 있습니다." },
      { label: "구체성", score: 82, desc: "실제 프로젝트 경험을 구체적인 기술 스택과 함께 설명하는 능력이 좋습니다. 특정 문제 상황과 해결 과정을 코드 레벨에서 설명하며, 성능 개선 수치 등 구체적인 결과를 제시합니다." },
      { label: "논리성", score: 87, desc: "기술적 의사결정 과정을 논리적으로 설명하며, 왜 특정 기술을 선택했는지 명확한 근거를 제시합니다. 문제 분석부터 해결까지의 사고 과정이 체계적으로 정리되어 있습니다." },
      { label: "진정성", score: 84, desc: "기술에 대한 진정한 관심과 학습 의욕이 느껴집니다. 단순히 기술을 나열하는 것이 아니라 깊이 있는 이해를 바탕으로 한 답변을 제시하며, 부족한 부분에 대해서도 솔직하게 인정합니다." },
      { label: "자료성", score: 81, desc: "다른 지원자와 차별화되는 프로젝트 경험과 기술적 고민이 있습니다. 특히 성능 최적화나 보안 이슈 해결 경험 등 실무적인 문제 해결 사례가 인상적입니다." }
    ]
  },
  dentist: {
    name: "치위생사",
    icon: "🦷",
    subtitle: "환자 관리 · 구강 보건 · 실무 능력",
    stats: { interviews: 28, hours: "20h", score: 87, improvement: "93%" },
    dimensions: { fit: 86, spec: 84, logic: 85, sincerity: 88, material: 83 },
    skills: [
      { icon: "🦷", name: "구강 보건 지식", score: 90, desc: "구강 위생 관리와 예방 치료에 대한 전문 지식을 갖추고 환자 교육을 잘 수행합니다. 치주 질환 예방과 구강 건강 증진을 위한 체계적인 접근이 돋보입니다." },
      { icon: "👥", name: "환자 응대 및 상담", score: 88, desc: "다양한 환자 유형에 맞는 친절하고 세심한 상담과 응대 능력이 뛰어납니다. 특히 어린이와 노인 환자에 대한 배려와 공감 능력이 우수합니다." },
      { icon: "🔧", name: "실무 처치 능력", score: 85, desc: "치과 진료 보조와 각종 처치를 정확하고 능숙하게 수행하는 실무 역량을 보유하고 있습니다. 진료 흐름을 파악하여 선제적으로 준비하는 능력이 탁월합니다." },
      { icon: "🛡️", name: "예방 처치", score: 87, desc: "스케일링, 불소 도포 등 예방 치료를 체계적으로 수행하는 능력이 우수합니다. 환자별 맞춤 예방 프로그램 제안으로 구강 건강 관리의 효과를 극대화합니다." },
      { icon: "🧼", name: "감염 관리 & 위생", score: 92, desc: "감염 관리 프로토콜을 철저히 준수하며 멸균과 소독에 만전을 기하고 있습니다. 교차 감염 방지를 위한 세심한 주의와 철저한 위생 관리로 안전한 진료 환경을 조성합니다." },
      { icon: "📋", name: "진료 보조 & 차트 관리", score: 83, desc: "진료 기록을 정확히 관리하고 차트 작성을 체계적으로 수행합니다. 디지털 차트 시스템 활용에 능숙하며 환자 정보를 체계적으로 관리하여 진료 효율성을 높입니다." }
    ],
    analysis: [
      { label: "적합성", score: 86, desc: "질문의 의도를 정확히 파악하고 그에 맞는 답변을 제시하는 능력이 우수합니다. 면접관이 원하는 핵심 내용을 놓치지 않고 전달하며, 질문과 답변의 연결성이 명확합니다. 치위생사로서 필요한 역량과 자질을 질문에 연관지어 효과적으로 표현하고 있습니다." },
      { label: "구체성", score: 84, desc: "추상적인 표현보다는 실제 경험과 구체적인 사례를 활용하여 답변하는 경향이 있습니다. 실습이나 봉사활동에서의 구체적인 상황, 수치, 결과를 제시하여 설득력을 높이고 있습니다. 다만 일부 답변에서 좀 더 세밀한 디테일을 추가하면 완성도가 높아질 것으로 보입니다." },
      { label: "논리성", score: 85, desc: "답변의 전개가 자연스럽고 논리적인 흐름을 유지하고 있습니다. 상황 제시 → 행동 → 결과의 구조를 잘 활용하며, 인과관계가 명확하게 드러납니다. 각 문장 간의 연결이 매끄럽고, 결론까지 일관성 있게 이어지는 서술 능력을 보여주고 있습니다." },
      { label: "진정성", score: 88, desc: "답변에서 진심이 느껴지며, 외운 듯한 느낌이 적습니다. 치위생사에 대한 열정과 환자 케어에 대한 진정한 관심이 잘 드러나고 있습니다. 자신의 경험을 바탕으로 솔직하게 이야기하는 태도가 신뢰감을 주며, 형식적이지 않은 자연스러운 답변 스타일을 유지하고 있습니다." },
      { label: "자료성", score: 83, desc: "다른 지원자와 차별화되는 본인만의 독특한 경험과 강점을 어느 정도 보여주고 있습니다. 특정 봉사 활동이나 특별한 실습 경험 등 차별화 포인트가 있으나, 좀 더 임팩트 있는 스토리나 특별한 성과를 추가하면 경쟁력이 더욱 높아질 것입니다." }
    ]
  },
  police: {
    name: "경찰 공무원",
    icon: "👮",
    subtitle: "공직 가치관 · 의사소통 · 위기 대응",
    stats: { interviews: 32, hours: "22h", score: 88, improvement: "95%" },
    dimensions: { fit: 90, spec: 86, logic: 88, sincerity: 91, material: 85 },
    skills: [
      { icon: "⚖️", name: "공직 가치관", score: 92, desc: "청렴성과 공정성을 중시하며 국민을 위해 봉사하는 공직자로서의 자세가 확고합니다." },
      { icon: "💬", name: "의사소통 능력", score: 89, desc: "다양한 상황에서 명확하고 효과적인 의사소통으로 민원인과 동료와 원활히 소통합니다." },
      { icon: "🚨", name: "상황 판단 및 대처", score: 87, desc: "돌발 상황에서 침착하게 우선순위를 판단하고 신속하게 대응하는 능력이 뛰어납니다." },
      { icon: "📚", name: "법규 지식", score: 85, desc: "경찰 관련 법규에 대한 이해도가 높고 실무에 적절히 적용할 수 있습니다." },
      { icon: "🤝", name: "팀워크 & 협력", score: 90, desc: "조직 내에서 동료들과 협력하여 공동의 목표를 달성하는 협업 능력이 우수합니다." },
      { icon: "💪", name: "책임감 & 사명감", score: 94, desc: "국민의 안전과 치안을 책임진다는 강한 사명감과 책임 의식을 가지고 있습니다." }
    ],
    analysis: [
      { label: "적합성", score: 90, desc: "경찰 공무원으로서 갖춰야 할 인성과 가치관을 명확히 이해하고 있으며, 질문의 의도에 부합하는 답변을 제시합니다. 공직자로서의 윤리 의식과 국민 안전에 대한 사명감이 잘 드러납니다." },
      { label: "구체성", score: 86, desc: "봉사활동이나 팀 프로젝트 경험을 구체적으로 설명하며, 실제 상황에서 어떻게 대처했는지 생생하게 전달합니다. 수치나 결과를 포함하여 설득력을 높입니다." },
      { label: "논리성", score: 88, desc: "상황 분석부터 판단, 행동, 결과까지의 과정이 논리적으로 연결됩니다. 특히 위기 상황에서의 의사결정 과정을 체계적으로 설명하는 능력이 뛰어납니다." },
      { label: "진정성", score: 91, desc: "경찰 공무원이 되고자 하는 진심 어린 동기와 열정이 느껴집니다. 형식적인 답변이 아닌 자신의 경험과 신념을 바탕으로 한 솔직한 답변이 신뢰를 줍니다." },
      { label: "자료성", score: 85, desc: "다른 지원자와 구별되는 봉사 경험이나 리더십 사례가 있습니다. 특히 공동체 의식과 책임감을 보여주는 구체적인 에피소드가 인상적입니다." }
    ]
  }
};

const Radar = ({ values }) => {
  const cx = 110, cy = 110, R = 90;
  const pt = (i, scale) => {
    const ang = (-90 + i * 72) * Math.PI / 180;
    const r = R * scale;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  const labels = ["적합성", "구체성", "논리성", "진정성", "자료성"];
  const vals = [
    values.fit / 100,
    values.spec / 100,
    values.logic / 100,
    values.sincerity / 100,
    values.material / 100
  ];
  const pts = vals.map((sc, i) => pt(i, sc)).map(p => p.join(",")).join(" ");

  return (
    <svg width="450" height="450" viewBox="0 0 220 220">
      {levels.map((g, gi) => (
        <polygon
          key={gi}
          points={[0, 1, 2, 3, 4].map(i => pt(i, g).join(',')).join(' ')}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
      ))}
      {[0, 1, 2, 3, 4].map(i => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1.5" />;
      })}
      <polygon
        points={pts}
        fill="rgba(59, 130, 246, 0.2)"
        stroke="#3b82f6"
        strokeWidth="2.5"
      />
      {vals.map((sc, i) => {
        const [x, y] = pt(i, sc);
        return <circle key={i} cx={x} cy={y} r="5" fill="#3b82f6" />;
      })}
      {labels.map((t, i) => {
        const [x, y] = pt(i, 1.18);
        return (
          <text
            key={t}
            x={x}
            y={y}
            fontSize="13"
            fontWeight="600"
            textAnchor="middle"
            fill="#1e293b"
          >
            {t}
          </text>
        );
      })}
    </svg>
  );
};

export default function RaonDashboard({ user }) {
  const [selectedRole, setSelectedRole] = useState("dentist");

  // user가 있으면 nickname 또는 name 사용, 없으면 "사용자"
  const displayName = user?.nickname || user?.name || "사용자";

  const currentData = DEMO_DATA[selectedRole];
  const attendedRoles = useMemo(() => {
    return DEFAULT_ROLES.filter(r => ["backend", "dentist", "police"].includes(r.key));
  }, []);

  return (
    <div className="learning-wrap">
      {/* Header */}
      <div className="page-header">
        <h1>📚 학습 기록</h1>
        <p>{displayName}님이 학습한 면접 기록을 확인하세요</p>
      </div>

      {/* Interviewer Selection */}
      <h2 className="section-title">{displayName}님이 본 면접관</h2>
      <div className="interviewer-grid">
        {attendedRoles.map(role => (
          <div
            key={role.key}
            className={`interviewer-card ${selectedRole === role.key ? 'selected' : ''}`}
            onClick={() => setSelectedRole(role.key)}
          >
            <div className="interviewer-icon">{role.icon}</div>
            <div className="interviewer-name">{role.name}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Detail Section */}
      <div className="detail-section">
        {/* Title */}
        <div className="header">
          <h2>
            <span className="header-icon">{currentData.icon}</span>
            {currentData.name} 학습 기록
          </h2>
          <p>{currentData.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{currentData.stats.interviews}</div>
            <div className="stat-label">총 면접 횟수</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{currentData.stats.hours}</div>
            <div className="stat-label">총 학습 시간</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{currentData.stats.score}점</div>
            <div className="stat-label">평균 점수</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{currentData.stats.improvement}</div>
            <div className="stat-label">향상도</div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="skills-section">
          <h3 className="section-header">📈 세부 스킬 분석</h3>
          <div className="skills-grid">
            {currentData.skills.map((skill, idx) => (
              <div key={idx} className="skill-item">
                <div className="skill-header">
                  <div className="skill-icon">{skill.icon}</div>
                  <div className="skill-name-score">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-score">{skill.score}점</span>
                  </div>
                </div>
                <div className="skill-bar">
                  <div className="skill-progress" style={{ width: `${skill.score}%` }} />
                </div>
                <p className="skill-desc">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Section */}
        <div className="radar-section">
          <h3 className="section-header">🎯 역량 분석</h3>
          <div className="criteria-list">
            <div className="criteria-item">
              <span className="criteria-label">적합성:</span>
              <span className="criteria-desc">질문의 의도에 맞는 답변인가?</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">구체성:</span>
              <span className="criteria-desc">추상적이지 않고 구체적인 사례가 포함되었는가?</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">논리성:</span>
              <span className="criteria-desc">답변의 흐름이 자연스럽고 논리적인가?</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">진정성:</span>
              <span className="criteria-desc">진실이 담긴 답변인가? 외운 느낌은 없는가?</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">자료성:</span>
              <span className="criteria-desc">다른 지원자와 구별되는 본인만의 강점이 드러나는가?</span>
            </div>
          </div>
          <div className="radar-container">
            <Radar values={currentData.dimensions} />
          </div>
        </div>

        {/* Analysis Section */}
        <div className="analysis-section">
          <h3 className="section-header">📊 역량별 상세 분석</h3>
          <div className="analysis-grid">
            {currentData.analysis.map((item, idx) => (
              <div key={idx} className="analysis-item">
                <div className="analysis-header">
                  <span className="analysis-label">{item.label}</span>
                  <span className="analysis-score">{item.score}점</span>
                </div>
                <p className="analysis-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}