import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RaonChat.css';

function RaonChat() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 아바타 선택 페이지에서 전달받은 정보
  const avatarInfo = location.state || {};
  const { selectedModel, selectedTTS, backgroundImage } = avatarInfo;

  // 메시지 목록 (날짜별로 관리)
  const [messagesByDate, setMessagesByDate] = useState({
    '2025-11-10': [
      { id: 1, type: 'ai', text: '안녕! 오늘 기분이 어때? 😊', time: '오후 3:25', bookmarked: false },
      { id: 2, type: 'user', text: '오늘은 기분이 좋아!!!!!', time: '오후 3:25', bookmarked: false },
      { id: 3, type: 'ai', text: '그렇구나! 무슨 좋은 일 있었어?', time: '오후 3:25', bookmarked: false },
      { id: 4, type: 'user', text: '좋은 꿈을 꿨어!!!!', time: '오후 3:25', bookmarked: false },
      { id: 5, type: 'ai', text: '외로움은 나쁜 게 아니라, 필요한 것을 알려주는 신호예요. 당신이 사람들과의 연결을 원한다는 걸 인정하는 게 중요해요.', time: '오후 3:26', bookmarked: true }
    ],
    '2025-11-09': [
      { id: 1, type: 'ai', text: '회사에서 힘든 일이 있었구나...', time: '오후 8:15', bookmarked: false },
      { id: 2, type: 'user', text: '응... 좀 힘들었어', time: '오후 8:16', bookmarked: false },
      { id: 3, type: 'ai', text: '작은 성공에도 스스로를 칭찬하세요. 완벽하지 않아도 괜찮아요.', time: '오후 8:17', bookmarked: true }
    ],
    '2025-11-08': [
      { id: 1, type: 'ai', text: '오늘 하루는 어땠어?', time: '오후 10:30', bookmarked: false },
      { id: 2, type: 'ai', text: '자신에게 친절하게 대하는 것도 중요한 능력이에요.', time: '오후 10:31', bookmarked: true }
    ]
  });

  // 현재 표시할 메시지 (오늘 날짜)
  const [currentDate] = useState('2025-11-10');
  const [messages, setMessages] = useState(messagesByDate['2025-11-10'] || []);
  const [filteredMessages, setFilteredMessages] = useState(messagesByDate['2025-11-10'] || []);

  // 입력창 텍스트
  const [inputText, setInputText] = useState('');
  
  // 검색 텍스트
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 메뉴 열림/닫힘
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // TTS 켜짐/꺼짐
  const [isTTSOn, setIsTTSOn] = useState(true);

  // 북마크 목록
  const [bookmarks, setBookmarks] = useState([
    { 
      id: 1, 
      date: '2025.11.10',
      time: '오후 3:25',
      messageText: '"안녕! 오늘 기분이 어때? 😊"',
      tags: '대화 주제: 기타'
    },
    { 
      id: 2, 
      date: '2025.11.10',
      time: '오후 3:26',
      messageText: '"외로움은 나쁜 게 아니라, 필요한 것을 알려주는 신호예요."',
      tags: '대화 주제: 외로움, 감정 인정'
    },
    { 
      id: 3, 
      date: '2025.11.09',
      time: '오후 8:17',
      messageText: '"작은 성공에도 스스로를 칭찬하세요. 완벽하지 않아도 괜찮아요."',
      tags: '대화 주제: 직장 스트레스'
    }
  ]);

  // 북마크 더보기 모달
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const bookmarksPerPage = 5;

  // 원본 대화 모달
  const [isOriginalChatModalOpen, setIsOriginalChatModalOpen] = useState(false);
  const [selectedBookmarkForChat, setSelectedBookmarkForChat] = useState(null);

  // 북마크 삭제 확인 모달
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState(null);

  // 요약하기 캘린더 모달
  const [isSummaryCalendarOpen, setIsSummaryCalendarOpen] = useState(false);
  const [selectedSummaryDate, setSelectedSummaryDate] = useState(null);

  // 요약 결과 모달
  const [isSummaryResultOpen, setIsSummaryResultOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  // 현재 년/월 (캘린더용)
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(11);

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
      }),
      bookmarked: false
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setFilteredMessages(updatedMessages);
    
    // 날짜별 메시지에도 추가
    const updatedDateMessages = { ...messagesByDate };
    if (!updatedDateMessages[currentDate]) {
      updatedDateMessages[currentDate] = [];
    }
    updatedDateMessages[currentDate].push(newMessage);
    setMessagesByDate(updatedDateMessages);
    
    setInputText('');
  };

  // Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 메시지 검색
  const handleSearch = () => {
    if (searchText.trim() === '') {
      setFilteredMessages(messages);
      setIsSearching(false);
    } else {
      const filtered = messages.filter(msg => 
        msg.text.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredMessages(filtered);
      setIsSearching(true);
    }
  };

  // 검색 취소
  const handleCancelSearch = () => {
    setSearchText('');
    setFilteredMessages(messages);
    setIsSearching(false);
  };

  // 북마크 토글
  const toggleBookmark = (messageId) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, bookmarked: !msg.bookmarked } : msg
    );
    setMessages(updatedMessages);
    setFilteredMessages(updatedMessages);

    // 날짜별 메시지 업데이트
    const updatedDateMessages = { ...messagesByDate };
    updatedDateMessages[currentDate] = updatedMessages;
    setMessagesByDate(updatedDateMessages);

    // 북마크된 메시지라면 북마크 목록에 추가
    const message = updatedMessages.find(m => m.id === messageId);
    if (message.bookmarked && message.type === 'ai') {
      const newBookmark = {
        id: bookmarks.length + 1,
        date: currentDate.split('-').join('.'),
        time: message.time,
        messageText: `"${message.text}"`,
        tags: '대화 주제: 기타'
      };
      setBookmarks([newBookmark, ...bookmarks]);
    } else if (!message.bookmarked) {
      // 북마크 해제시 목록에서 제거
      setBookmarks(bookmarks.filter(b => b.messageText !== `"${message.text}"`));
    }
  };

  // 북마크 삭제 확인 열기
  const openDeleteConfirm = (bookmarkId) => {
    setDeletingBookmarkId(bookmarkId);
    setIsDeleteConfirmOpen(true);
  };

  // 북마크 삭제 확인
  const confirmDeleteBookmark = () => {
    setBookmarks(bookmarks.filter(b => b.id !== deletingBookmarkId));
    setIsDeleteConfirmOpen(false);
    setDeletingBookmarkId(null);
  };

  // 북마크 삭제 취소
  const cancelDeleteBookmark = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingBookmarkId(null);
  };

  // 원본 대화로 이동
  const goToOriginalChat = (bookmark) => {
    setSelectedBookmarkForChat(bookmark);
    setIsOriginalChatModalOpen(true);
  };

  // 북마크 페이지네이션
  const totalBookmarkPages = Math.ceil(bookmarks.length / bookmarksPerPage);
  const displayedBookmarks = bookmarks.slice(
    (bookmarkPage - 1) * bookmarksPerPage,
    bookmarkPage * bookmarksPerPage
  );

  // 캘린더 날짜 생성
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startDayOfWeek) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      calendar.push(week);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  // 해당 날짜에 채팅이 있는지 확인
  const hasChat = (day) => {
    if (!day) return false;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return messagesByDate[dateStr] && messagesByDate[dateStr].length > 0;
  };

  // 날짜 선택 (요약하기 준비)
  const selectDateForSummary = (day) => {
    if (!hasChat(day)) return;
    
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedSummaryDate(dateStr);
  };

  // 채팅 요약하기 실행
  const executeSummary = () => {
    if (!selectedSummaryDate) {
      alert('요약할 날짜를 선택해주세요.');
      return;
    }

    // AI 요약 생성 (실제로는 API 호출)
    const dateMessages = messagesByDate[selectedSummaryDate] || [];
    const aiSummary = `${selectedSummaryDate.split('-').join('.')} 대화 요약:\n\n` +
      `오늘은 ${dateMessages.filter(m => m.type === 'user').length}개의 메시지를 나누었습니다.\n` +
      `주요 대화 주제: 감정 표현, 일상 공유\n\n` +
      `주요 내용:\n` +
      dateMessages.filter(m => m.type === 'ai').slice(0, 3).map(m => `- ${m.text}`).join('\n');
    
    setSummaryText(aiSummary);
    setIsSummaryCalendarOpen(false);
    setIsSummaryResultOpen(true);
  };

  // 이전/다음 달로 이동
  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const calendar = generateCalendar();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`message-${message.type}`}
              >
                <div className="message-content-wrapper">
                  <div className={`message-bubble-${message.type}`}>
                    {message.text}
                  </div>
                  {message.type === 'ai' && (
                    <button 
                      className={`bookmark-btn ${message.bookmarked ? 'bookmarked' : ''}`}
                      onClick={() => toggleBookmark(message.id)}
                      title="북마크"
                    >
                      ⭐
                    </button>
                  )}
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
                placeholder={isSearching ? "검색 중..." : "메시지를 입력하세요..."}
                value={isSearching ? searchText : inputText}
                onChange={(e) => isSearching ? setSearchText(e.target.value) : setInputText(e.target.value)}
                onKeyPress={isSearching ? (e) => e.key === 'Enter' && handleSearch() : handleKeyPress}
              />
              {isSearching ? (
                <span className="search-icon" onClick={handleCancelSearch} title="검색 취소">✕</span>
              ) : (
                <span className="search-icon" onClick={() => setIsSearching(true)} title="검색">🔍</span>
              )}
            </div>
            {isSearching ? (
              <button className="send-btn search-mode" onClick={handleSearch}>
                🔍
              </button>
            ) : (
              <button className="send-btn" onClick={handleSendMessage}>
                ➤
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 오버레이 */}
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

          {/* 나의 북마크 섹션 */}
          <div className="menu-section">
            <div className="section-header-left">
              <div className="section-title-icon">⭐ 나의 북마크</div>
              <button 
                className="add-note-btn"
                onClick={() => setIsBookmarkModalOpen(true)}
              >
                + 더보기
              </button>
            </div>

            <div className="bookmarks-list">
              {bookmarks.slice(0, 3).map(bookmark => (
                <div key={bookmark.id} className="bookmark-item">
                  <div className="bookmark-header">
                    <div className="bookmark-datetime">{bookmark.date} {bookmark.time}</div>
                  </div>
                  <div className="bookmark-message">{bookmark.messageText}</div>
                  <div className="bookmark-tags">{bookmark.tags}</div>
                  <div className="bookmark-actions">
                    <button 
                      className="bookmark-action-btn original-btn"
                      onClick={() => goToOriginalChat(bookmark)}
                    >
                      💬 원본 대화
                    </button>
                    <button 
                      className="bookmark-action-btn delete-btn"
                      onClick={() => openDeleteConfirm(bookmark.id)}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 요약 노트 섹션 */}
          <div className="menu-section">
            <div className="section-header-left">
              <div className="section-title-icon">📊 요약 노트</div>
              <button 
                className="add-note-btn summary-btn"
                onClick={() => setIsSummaryCalendarOpen(true)}
              >
                + 요약하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 북마크 더보기 모달 */}
      {isBookmarkModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBookmarkModalOpen(false)}>
          <div className="modal-content modal-bookmark" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h3>⭐ 나의 북마크</h3>
              <button className="close-btn" onClick={() => setIsBookmarkModalOpen(false)}>✕</button>
            </div>

            <div className="bookmark-info-box-centered">
              <div className="bookmark-info-title-centered">💬 나중에 다시 보고 싶은 대화</div>
              <div className="bookmark-info-desc-centered">
                AI가 해준 조언 중 마음에 드는 말을 북마크하고<br/>
                힘들 때 다시 꺼내볼 수 있어요
              </div>
              <div className="bookmark-howto-centered">
                <div className="howto-title-centered">📌 북마크 저장 방법</div>
                <div className="howto-desc-centered">
                  채팅 중 AI의 메시지 아래에 있는 ⭐ 버튼을 클릭하면<br/>
                  이 페이지에 자동으로 저장됩니다!
                </div>
              </div>
            </div>

            <div className="bookmarks-list-modal">
              {displayedBookmarks.map(bookmark => (
                <div key={bookmark.id} className="bookmark-item">
                  <div className="bookmark-header">
                    <div className="bookmark-datetime">{bookmark.date} {bookmark.time}</div>
                  </div>
                  <div className="bookmark-message">{bookmark.messageText}</div>
                  <div className="bookmark-tags">{bookmark.tags}</div>
                  <div className="bookmark-actions">
                    <button 
                      className="bookmark-action-btn original-btn"
                      onClick={() => {
                        setIsBookmarkModalOpen(false);
                        goToOriginalChat(bookmark);
                      }}
                    >
                      💬 원본 대화
                    </button>
                    <button 
                      className="bookmark-action-btn delete-btn"
                      onClick={() => {
                        setIsBookmarkModalOpen(false);
                        openDeleteConfirm(bookmark.id);
                      }}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalBookmarkPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  disabled={bookmarkPage === 1}
                  onClick={() => setBookmarkPage(bookmarkPage - 1)}
                >
                  이전
                </button>
                <span className="page-info">
                  {bookmarkPage} / {totalBookmarkPages}
                </span>
                <button 
                  className="page-btn"
                  disabled={bookmarkPage === totalBookmarkPages}
                  onClick={() => setBookmarkPage(bookmarkPage + 1)}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 원본 대화 모달 */}
      {isOriginalChatModalOpen && selectedBookmarkForChat && (
        <div className="modal-overlay" onClick={() => setIsOriginalChatModalOpen(false)}>
          <div className="modal-content modal-original-chat" onClick={(e) => e.stopPropagation()}>
            <div className="original-chat-content">
              <p className="original-chat-message">
                {selectedBookmarkForChat.date} {selectedBookmarkForChat.time} 대화로 이동합니다.
              </p>
              <button 
                className="modal-confirm-btn"
                onClick={() => {
                  setIsOriginalChatModalOpen(false);
                  // 실제로는 해당 날짜의 메시지로 스크롤
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 북마크 삭제 확인 모달 */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={cancelDeleteBookmark}>
          <div className="modal-content modal-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">이 북마크를 삭제하시겠습니까?</h3>
            <p className="delete-confirm-message">삭제된 북마크는 복구할 수 없습니다.</p>
            <div className="delete-confirm-actions">
              <button className="delete-cancel-btn" onClick={cancelDeleteBookmark}>취소</button>
              <button className="delete-confirm-btn" onClick={confirmDeleteBookmark}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* 요약하기 캘린더 모달 */}
      {isSummaryCalendarOpen && (
        <div className="modal-overlay" onClick={() => setIsSummaryCalendarOpen(false)}>
          <div className="modal-content modal-summary-calendar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h3>📅 채팅 요약하기</h3>
              <button className="close-btn" onClick={() => setIsSummaryCalendarOpen(false)}>✕</button>
            </div>

            <p className="calendar-desc">요약하고 싶은 날짜를 선택하세요</p>

            <div className="calendar-container-modal">
              <div className="calendar-header">
                <button className="month-btn" onClick={() => changeMonth('prev')}>◀</button>
                <div className="month-display">{currentYear}년 {currentMonth}월</div>
                <button className="month-btn" onClick={() => changeMonth('next')}>▶</button>
              </div>

              <div className="calendar-grid">
                <div className="weekdays">
                  {weekDays.map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
                {calendar.map((week, weekIdx) => (
                  <div key={weekIdx} className="week-row">
                    {week.map((day, dayIdx) => (
                      <div 
                        key={dayIdx} 
                        className={`calendar-day ${!day ? 'empty' : ''} ${hasChat(day) ? 'has-chat' : 'no-chat'} ${
                          selectedSummaryDate === `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'selected' : ''
                        }`}
                        onClick={() => selectDateForSummary(day)}
                      >
                        {day || ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-action-section">
              <button 
                className="summary-execute-btn"
                onClick={executeSummary}
                disabled={!selectedSummaryDate}
              >
                📝 채팅 요약하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 결과 모달 */}
      {isSummaryResultOpen && (
        <div className="modal-overlay" onClick={() => setIsSummaryResultOpen(false)}>
          <div className="modal-content modal-summary-result" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h3>📝 대화 요약</h3>
              <button className="close-btn" onClick={() => setIsSummaryResultOpen(false)}>✕</button>
            </div>

            <div className="summary-result-box">
              <pre className="summary-text">{summaryText}</pre>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-submit-btn"
                onClick={() => setIsSummaryResultOpen(false)}
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