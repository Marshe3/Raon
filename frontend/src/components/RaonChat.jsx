import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RaonChat.css';

function RaonChat() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 아바타 선택 페이지에서 전달받은 정보
  const avatarInfo = location.state || {};
  const { selectedModel, selectedTTS, backgroundImage } = avatarInfo;

  // 메시지 목록
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: '안녕! 오늘 기분은 어때? 😊',
      time: '오후 3:25'
    },
    {
      id: 2,
      type: 'user',
      text: '오늘은 기분이 좋아!!!!!',
      time: '오후 3:25'
    },
    {
      id: 3,
      type: 'ai',
      text: '그렇구나! 무슨 좋은 일 있었어?',
      time: '오후 3:25'
    },
    {
      id: 4,
      type: 'user',
      text: '좋은 꿈을 꿨어!!!!',
      time: '오후 3:25'
    }
  ]);

  // 입력창 텍스트
  const [inputText, setInputText] = useState('');

  // 메뉴 열림/닫힘
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // TTS 켜짐/꺼짐
  const [isTTSOn, setIsTTSOn] = useState(true);

  // 나의 기록 목록
  const [myRecords, setMyRecords] = useState([
    { id: 1, title: '오늘 음식 추천', date: '2025.10.02', content: '오늘은 회사에서의 스트레스와 외로움에 대해 이야기했어요. 혼자 있는 시간을 의미있게 보내는 방법을 찾고 계시네요.' },
    { id: 2, title: '거울 신발 추천', date: '2025.10.02', content: 'AI가 해준 말 중 위로가 되거나 도움이 된 내용을 적어보세요' },
    { id: 3, title: '빨 추천', date: '2025.10.02', content: 'AI가 해준 말 중 위로가 되거나 도움이 된 내용을 적어보세요' }
  ]);

  // 요약 노트 목록 (통합)
  const [summaryRecords, setSummaryRecords] = useState([
    { 
      id: 1,
      datetime: '2025.11.10 오후 3:25',
      mood: '기쁨',
      moodEmoji: '😊',
      tags: ['오늘 힘들었던 점', 'AI에게 위로받은 것'],
      mainThought: '오늘은 기분이 좋았다. \'연결됨\'이란 대화하면서...',
      aiSummary: '오늘은 회사에서의 스트레스와 외로움에 대해 이야기했어요. 혼자 있는 시간을 의미있게 보내는 방법을 찾고 계시네요. 외로움은 나쁜 감정이 아니라, 나에게 필요한 것을 알려주는 신호입니다.',
      keywords: ['#직장스트레스', '#외로움', '#자기돌봄'],
      aiAdvice: '"외로움은 나쁜 게 아니라, 나에게 필요한 것을 알려주는 신호일 수 있어요."라는 말이 와닿았다. 내가 사람들과의 연결을 원한다는 걸 인정하는 게 중요하구나.',
      connectionType: '연결됨'
    },
    { 
      id: 2,
      datetime: '2025.11.10 오전 10:30',
      mood: '평온',
      moodEmoji: '😌',
      tags: ['새롭게 깨달은 점'],
      mainThought: '아침에 명상하도 대화했다. 마음이 차분해졌어...',
      aiSummary: '아침 명상의 효과와 마음의 평온함에 대해 이야기 나눴어요.',
      keywords: ['#명상', '#평온', '#자기성찰'],
      aiAdvice: '규칙적인 명상이 큰 도움이 된다는 것을 배웠어요.',
      connectionType: '마이크 권한 허용됨'
    },
    { 
      id: 3,
      datetime: '2025.11.09 오후 8:15',
      mood: '우울',
      moodEmoji: '😔',
      tags: ['오늘 힘들었던 점'],
      mainThought: '회사에서 힘든 일이 있었다...',
      aiSummary: '업무 스트레스와 대인관계의 어려움에 대해 나눴어요.',
      keywords: ['#업무스트레스', '#대인관계'],
      aiAdvice: '힘든 감정을 인정하는 것이 첫 번째 단계라는 걸 알았어요.',
      connectionType: '연결됨'
    }
  ]);

  // 노트 옵션 메뉴
  const [activeNoteMenu, setActiveNoteMenu] = useState(null);

  // 감정 일기 모달 (요약하기)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryForm, setSummaryForm] = useState({
    mood: '기쁨',
    tags: [],
    mainThought: '',
    aiAdvice: ''
  });

  // 이름 바꾸기 모달
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renamingRecordId, setRenamingRecordId] = useState(null);
  const [newRecordName, setNewRecordName] = useState('');

  // 요약 노트 상세보기 모달
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isSummaryDetailOpen, setIsSummaryDetailOpen] = useState(false);

  // 요약 노트 확장/축소 상태
  const [expandedSummary, setExpandedSummary] = useState(null);

  // 요약 노트 필터
  const [summaryFilter, setSummaryFilter] = useState('전체');

  // 메시지 전송
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  // Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 노트 옵션 토글
  const toggleNoteMenu = (recordId) => {
    setActiveNoteMenu(activeNoteMenu === recordId ? null : recordId);
  };

  // 기록 삭제
  const deleteRecord = (recordId) => {
    setMyRecords(myRecords.filter(record => record.id !== recordId));
    setActiveNoteMenu(null);
  };

  // 이름 바꾸기 모달 열기
  const openRenameModal = (recordId) => {
    const record = myRecords.find(r => r.id === recordId);
    setRenamingRecordId(recordId);
    setNewRecordName(record.title);
    setIsRenameModalOpen(true);
    setActiveNoteMenu(null);
  };

  // 이름 바꾸기 확인
  const confirmRename = () => {
    if (newRecordName.trim() === '') return;
    
    setMyRecords(myRecords.map(r => 
      r.id === renamingRecordId ? { ...r, title: newRecordName } : r
    ));
    setIsRenameModalOpen(false);
    setRenamingRecordId(null);
    setNewRecordName('');
  };

  // 태그 토글 함수
  const toggleTag = (tag) => {
    setSummaryForm(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      
      // 태그를 mainThought에 추가
      let newThought = prev.mainThought;
      if (!prev.tags.includes(tag)) {
        newThought = newThought ? `${newThought}\n\n${tag}:\n` : `${tag}:\n`;
      }
      
      return { ...prev, tags: newTags, mainThought: newThought };
    });
  };

  // 요약하기 저장
  const saveSummary = () => {
    if (summaryForm.mainThought.trim() === '') {
      alert('대화하면서 든 생각을 입력해주세요.');
      return;
    }

    const moodEmojis = {
      '기쁨': '😊',
      '우울': '😔',
      '불안': '😰',
      '화남': '😠',
      '평온': '😌'
    };

    // AI가 실제로 대화 내용을 분석하여 요약 (여기서는 예시)
    const aiGeneratedSummary = `오늘은 회사에서의 스트레스와 외로움에 대해 이야기했어요. 혼자 있는 시간을 의미있게 보내는 방법을 찾고 계시네요. 외로움은 나쁜 감정이 아니라, 나에게 필요한 것을 알려주는 신호입니다.`;

    const newSummary = {
      id: summaryRecords.length + 1,
      datetime: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\. /g, '.').replace(/\.(?=\s)/g, '.'),
      mood: summaryForm.mood,
      moodEmoji: moodEmojis[summaryForm.mood],
      tags: summaryForm.tags,
      mainThought: summaryForm.mainThought.substring(0, 50) + (summaryForm.mainThought.length > 50 ? '...' : ''),
      aiSummary: aiGeneratedSummary,
      keywords: ['#직장스트레스', '#외로움', '#자기돌봄'], // AI가 자동 추출
      aiAdvice: summaryForm.aiAdvice,
      connectionType: '연결됨'
    };

    setSummaryRecords([newSummary, ...summaryRecords]);
    setSummaryForm({ mood: '기쁨', tags: [], mainThought: '', aiAdvice: '' });
    setIsSummaryModalOpen(false);
  };

  // 요약 노트 상세보기
  const openSummaryDetail = (summary) => {
    setSelectedSummary(summary);
    setIsSummaryDetailOpen(true);
  };

  // 요약 노트 토글
  const toggleSummaryExpand = (summaryId) => {
    setExpandedSummary(expandedSummary === summaryId ? null : summaryId);
  };

  // 필터링된 요약 노트
  const filteredSummaries = summaryFilter === '전체' 
    ? summaryRecords 
    : summaryRecords.filter(s => s.mood === summaryFilter);

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
        {/* 왼쪽: AI 모델 */}
        <div className="ai-model-container">
          <div 
            className="ai-display-box"
            style={backgroundImage ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            AI
          </div>
          <div className="ai-status-bar">
            <span className="status-label">상태:</span>
            <span className="status-indicator"></span>
            <span className="status-text">연결됨 🟢 | 마이크 권한 허용됨</span>
          </div>
          
          {/* 선택된 모델/TTS 정보 표시 */}
          {selectedModel && (
            <div className="model-info-box">
              <div className="info-item">
                <span className="info-label">모델:</span>
                <span className="info-value">{selectedModel.split('-')[0]}</span>
              </div>
              <div className="info-item">
                <span className="info-label">TTS:</span>
                <span className="info-value">{selectedTTS}</span>
              </div>
            </div>
          )}
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
              />
              <span className="edit-icon">✏️</span>
            </div>
            <button className="send-btn" onClick={handleSendMessage}>
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* 메뉴 열릴 때 반투명 오버레이 */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {/* 사이드 메뉴 */}
      {isMenuOpen && (
        <div className="side-menu">
          <div className="menu-header">
            <h3>메뉴</h3>
            <button 
              className="close-menu-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="menu-section">
            <div className="section-title">🎨 새 채팅</div>
            
            <div className="menu-item">
              <span>TTS ON/OFF</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isTTSOn}
                  onChange={() => setIsTTSOn(!isTTSOn)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="menu-section">
            <div className="section-header">
              <div className="section-title">나의 기록</div>
              <button 
                className="add-note-btn"
                onClick={() => setIsSummaryModalOpen(true)}
              >
                + 새로운 기록
              </button>
            </div>

            <div className="notes-list">
              {myRecords.map(record => (
                <div key={record.id} className="note-item">
                  <div className="note-info">
                    <div className="note-title">{record.title}</div>
                    <div className="note-date">{record.date}</div>
                  </div>
                  <div className="note-menu-wrapper">
                    <button 
                      className="note-menu-btn"
                      onClick={() => toggleNoteMenu(record.id)}
                    >
                      ⋯
                    </button>
                    
                    {activeNoteMenu === record.id && (
                      <div className="note-dropdown">
                        <div 
                          className="dropdown-item"
                          onClick={() => openRenameModal(record.id)}
                        >
                          ✏️ 이름 바꾸기
                        </div>
                        <div 
                          className="dropdown-item delete"
                          onClick={() => deleteRecord(record.id)}
                        >
                          🗑️ 삭제
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 요약 노트 섹션 */}
          <div className="menu-section">
            <div className="section-header">
              <div className="section-title">📊 요약 노트</div>
              <button 
                className="add-note-btn"
                onClick={() => setIsSummaryModalOpen(true)}
              >
                + 요약하기
              </button>
            </div>

            {/* 필터 버튼 */}
            <div className="summary-filter-tabs">
              <button 
                className={`filter-tab ${summaryFilter === '전체' ? 'active' : ''}`}
                onClick={() => setSummaryFilter('전체')}
              >
                전체
              </button>
              <button 
                className={`filter-tab ${summaryFilter === '기쁨' ? 'active' : ''}`}
                onClick={() => setSummaryFilter('기쁨')}
              >
                😊 기쁨
              </button>
              <button 
                className={`filter-tab ${summaryFilter === '우울' ? 'active' : ''}`}
                onClick={() => setSummaryFilter('우울')}
              >
                😔 우울
              </button>
              <button 
                className={`filter-tab ${summaryFilter === '불안' ? 'active' : ''}`}
                onClick={() => setSummaryFilter('불안')}
              >
                😰 불안
              </button>
            </div>

            {/* 요약 노트 목록 */}
            <div className="summary-timeline">
              <div className="timeline-label">📅 전체 나의 기록</div>
              {filteredSummaries.map(summary => (
                <div key={summary.id} className="summary-card">
                  <div 
                    className="summary-card-header"
                    onClick={() => toggleSummaryExpand(summary.id)}
                  >
                    <div className="summary-datetime">{summary.datetime}</div>
                    <div className="summary-connection-type">
                      <span className="connection-badge">{summary.connectionType}</span>
                    </div>
                  </div>
                  
                  <div className="summary-mood-line">
                    <span className="mood-emoji-large">{summary.moodEmoji}</span>
                    <span className="mood-text">{summary.mood}</span>
                  </div>

                  <div className="summary-preview">
                    {summary.mainThought}
                  </div>

                  {/* 확장된 내용 */}
                  {expandedSummary === summary.id && (
                    <div className="summary-expanded">
                      <div className="expanded-section">
                        <div className="expanded-title">💬 대화하면서 든 생각</div>
                        <div className="expanded-tags">
                          {summary.tags.map((tag, idx) => (
                            <span key={idx} className="expanded-tag">{tag}</span>
                          ))}
                        </div>
                        <p className="expanded-text">{summary.mainThought}</p>
                      </div>

                      <div className="expanded-section ai-summary-section">
                        <div className="expanded-title">🎭 AI가 요약한 오늘의 대화</div>
                        <p className="expanded-text">{summary.aiSummary}</p>
                        <div className="keyword-tags">
                          {summary.keywords.map((keyword, idx) => (
                            <span key={idx} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>

                      <div className="expanded-section">
                        <div className="expanded-title">💡 기억하고 싶은 AI의 조언</div>
                        <p className="expanded-text">{summary.aiAdvice}</p>
                      </div>

                      <div className="summary-actions">
                        <button className="action-btn back-btn">← 목록으로</button>
                        <button className="action-btn edit-btn">수정하기</button>
                        <button className="action-btn delete-btn">삭제하기</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 감정 일기 모달 (요약하기) */}
      {isSummaryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSummaryModalOpen(false)}>
          <div className="modal-content modal-summary" onClick={(e) => e.stopPropagation()}>
            <h3>💬 감정 일기 (가장 추천)</h3>
            <p className="modal-subtitle">AI와 대화한 후 자신의 감정과 생각을 기록하는 공간으로 전환</p>
            
            <div className="mood-section">
              <div className="mood-label">오늘 나의 기분은?</div>
              <div className="mood-options">
                {['기쁨', '우울', '불안', '화남', '평온'].map(mood => (
                  <button
                    key={mood}
                    className={`mood-btn ${summaryForm.mood === mood ? 'active' : ''}`}
                    onClick={() => setSummaryForm({...summaryForm, mood})}
                  >
                    {mood === '기쁨' && '😊'}
                    {mood === '우울' && '😔'}
                    {mood === '불안' && '😰'}
                    {mood === '화남' && '😠'}
                    {mood === '평온' && '😌'}
                    <br />
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="thought-section">
              <div className="thought-label">대화하면서 든 생각</div>
              <div className="thought-tags">
                {['오늘 힘들었던 점', 'AI에게 위로받은 것', '새롭게 깨달은 점', '감사한 일'].map(tag => (
                  <span 
                    key={tag}
                    className={`thought-tag ${summaryForm.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <textarea
              className="summary-textarea"
              placeholder="오늘 AI와 대화하면서 내가 생각보다 외로움을 많이 느끼고 있다는 걸 알았다."
              value={summaryForm.mainThought}
              onChange={(e) => setSummaryForm({...summaryForm, mainThought: e.target.value})}
            />

            <div className="form-group">
              <label className="form-label">기억하고 싶은 AI의 조언</label>
              <textarea
                className="note-textarea small"
                placeholder="AI가 해준 말 중 위로가 되거나 도움이 된 내용을 적어보세요"
                value={summaryForm.aiAdvice}
                onChange={(e) => setSummaryForm({...summaryForm, aiAdvice: e.target.value})}
              />
            </div>

            <div className="modal-footer">
              <button 
                className="attach-btn"
                onClick={() => alert('AI가 대화 내용을 분석하여 자동으로 요약합니다!')}
              >
                📎 채팅요약하기
              </button>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-cancel-btn"
                onClick={() => setIsSummaryModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="modal-submit-btn"
                onClick={saveSummary}
              >
                💾 오늘의 일기 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이름 바꾸기 모달 */}
      {isRenameModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRenameModalOpen(false)}>
          <div className="modal-content modal-rename" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ 이름 바꾸기</h3>
            <p className="modal-subtitle">기록의 제목을 수정하세요</p>
            
            <input
              type="text"
              className="rename-input"
              value={newRecordName}
              onChange={(e) => setNewRecordName(e.target.value)}
              placeholder="새 이름을 입력하세요"
              maxLength={50}
            />
            
            <div className="char-count">{newRecordName.length}/50</div>
            
            <div className="modal-actions">
              <button 
                className="modal-cancel-btn"
                onClick={() => setIsRenameModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="modal-submit-btn"
                onClick={confirmRename}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaonChat;