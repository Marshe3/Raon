import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RaonChatList.css";

function RaonChatList() {
  const navigate = useNavigate();

  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("time");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  useEffect(() => {
    const testData = [
      { id: 1, title: "친구 아바타와의 대화", lastMessage: "오늘 기분이 어때?", lastMessageTime: "2시간 전", timestamp: new Date("2025-01-04T20:00:00") },
      { id: 2, title: "영어 선생님 아바타와의 대화", lastMessage: "Let's practice English!", lastMessageTime: "어제", timestamp: new Date("2025-01-03T10:00:00") },
      { id: 3, title: "상담 아바타와의 대화", lastMessage: "힘든 일이 있었구나", lastMessageTime: "4일 전", timestamp: new Date("2024-12-31T15:00:00") },
      { id: 4, title: "학습 선생님 아바타와의 대화", lastMessage: "또 어려운 부분있어?", lastMessageTime: "2일 전", timestamp: new Date("2025-01-02T14:00:00") },
      { id: 5, title: "건강관리 아바타와의 대화", lastMessage: "오늘 운동도 화이팅!", lastMessageTime: "5시간 전", timestamp: new Date("2025-01-04T17:00:00") },
      { id: 6, title: "여행계획 아바타와의 대화", lastMessage: "일본 도쿄는 어때?", lastMessageTime: "5일 전", timestamp: new Date("2024-12-30T09:00:00") },
      { id: 7, title: "취미생활 찾기 아바타와의 대화", lastMessage: "걷기말고 뜨개질같은 건 어때?", lastMessageTime: "3시간 전", timestamp: new Date("2025-01-04T19:00:00") },
      { id: 8, title: "영화추천 아바타와의 대화", lastMessage: "공포영화는 뭐가 재밌어?", lastMessageTime: "1일 전", timestamp: new Date("2025-01-03T16:00:00") },
      { id: 9, title: "음악추천 아바타와의 대화", lastMessage: "2000년대 발라드도 좋아", lastMessageTime: "2시간 전", timestamp: new Date("2025-01-04T20:00:00") },
      { id: 10, title: "10월 목표 및 계획 실행 아바타와의 대화", lastMessage: '오늘은 2시 "친구와의 약속", 8시 "헬스장가기"가 계획되어 있습니다', lastMessageTime: "6시간 전", timestamp: new Date("2025-01-04T16:00:00") },
    ];
    const timer = setTimeout(() => {
      setChatRooms(testData);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => setSearchQuery(searchInput.trim());
  const handleInputChange = (e) => {
    const v = e.target.value;
    setSearchInput(v);
    if (v.trim() === "") setSearchQuery("");
  };

  const handleSortChange = (order) => setSortOrder(order);

  const handleOpenDeleteModal = (roomId, e) => {
    e.stopPropagation();
    setDeletingRoomId(roomId);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = () => {
    setChatRooms((prev) => prev.filter((r) => r.id !== deletingRoomId));
    setShowDeleteModal(false);
    setDeletingRoomId(null);
  };
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingRoomId(null);
  };

  const filtered = chatRooms.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) =>
    sortOrder === "time" ? b.timestamp - a.timestamp : a.title.localeCompare(b.title, "ko")
  );

  const handleChatRoomClick = (roomId) => {
    // TODO: 해당 채팅방으로 이동
    console.log("채팅방 클릭:", roomId);
  };

  const handleNewChat = () => navigate("/avatar");

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="chat-room-list-container">
      {/* 헤더 */}
      <div className="raon-header">
        <div className="raon-logo" onClick={() => navigate("/")} role="button">
          RAON
        </div>
        <div className="raon-nav-menu">
          <button className="active">내 채팅방</button>
          <button onClick={() => navigate("/avatar")}>새 채팅방</button>
          <button>요약</button>
          <button>노트</button>
          <button>메뉴</button>
        </div>
      </div>

      {/* 메인 */}
      <div className="chat-room-section">
        <div className="section-header">
          <h2>내 채팅방</h2>
          <button className="add-chat-btn" onClick={handleNewChat}>+ 새채팅 시작</button>
        </div>

        {/* 검색 */}
        <div className="search-box">
          <input
            type="text"
            placeholder="검색"
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch} type="button">
            검색
          </button>
        </div>

        {/* 정렬 */}
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortOrder === "time" ? "active" : ""}`}
            onClick={() => handleSortChange("time")}
          >
            시간순
          </button>
          <button
            className={`sort-btn ${sortOrder === "name" ? "active" : ""}`}
            onClick={() => handleSortChange("name")}
          >
            가나다순
          </button>
        </div>

        {/* 목록 */}
        <div className="chat-rooms-list">
          {sorted.length === 0 ? (
            <div className="no-results">검색 결과가 없습니다.</div>
          ) : (
            sorted.map((room) => (
              <div key={room.id} className="chat-room-item" onClick={() => handleChatRoomClick(room.id)}>
                <div className="chat-room-main">
                  <div className="chat-room-title-row">
                    <h3 className="chat-room-title">{room.title}</h3>
                    <span className="chat-category">🤖 AI</span>
                  </div>
                  <p className="chat-room-last-message">마지막: {room.lastMessage}</p>
                </div>

                <div className="chat-room-side">
                  <span className="chat-room-time">{room.lastMessageTime}</span>
                  <button className="exit-btn" onClick={(e) => handleOpenDeleteModal(room.id, e)}>
                    나가기
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">이 채팅방을 나가시겠습니까?</h3>
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn" onClick={handleConfirmDelete}>확인</button>
              <button className="modal-btn cancel-btn" onClick={handleCancelDelete}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaonChatList;
