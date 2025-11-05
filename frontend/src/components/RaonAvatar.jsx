import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./RaonAvatar.css";

function RaonAvatar() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 모델/TTS 데이터
  const models = [
    "chaehee_livechat-front-white_suit-natural_loop",
    "yoori-front-white_cardigan-nodded",
    "yeana-front-white_jacket-nodded",
    "white_f_5_karin-front-pleated_blouse-natural",
    "white_f_3_rachel-front-flight_attendant-natural",
    "white_f_1_bian-front-tube_top_mini_dress-natural",
    "tiara-front-uniform-nodded",
    "soobin-front-pink_setup-nodded",
    "rudia-front-lovely_pink_cropped_knit-natural",
    "nathalie-front-uniform-nodded",
    "mia-front-highteen_style-nodded",
    "lunie-front-overalls-nodded",
    "k_idol_m_3_yeon_hajin-front-navy_shirt-natural_move",
    "k_idol_m_2_zino-front-white_blouse-natural",
    "k_idol_f_1_sei-front-ruffle_mini_dress-natural",
    "jiwon-front-yellow_sweater-nodded",
    "jisoo-front-uniform-nodded",
    "hns-front-uniform-nodded",
    "eilee-front-white_suit-nodded",
    "devlin-front-white_shirt-nodded",
    "curi-front-white_shirt-nodded",
    "kny-front-natural",
  ];

  const ttsTypes = [
    "kny-onprem",
    "openai-ash",
    "chaehee",
    "devin-onprem",
    "hns_v2",
    "curi",
    "openai-echo",
    "openai-nova",
    "rudia",
    "k_idol_m_3_yoon_hajin",
    "k_idol_m_2_zino",
    "yuri",
  ];

  // 상태
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTTS, setSelectedTTS] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [ttsDropdownOpen, setTtsDropdownOpen] = useState(false);

  // 선택 핸들러
  const handleSelectModel = (m) => {
    setSelectedModel(m);
    setModelDropdownOpen(false);
  };
  const handleSelectTTS = (t) => {
    setSelectedTTS(t);
    setTtsDropdownOpen(false);
  };

  // 이미지 업로드/제거
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBackgroundPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setBackgroundPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 액션
  const handleStartChat = () => {
    if (!selectedModel || !selectedTTS) {
      alert("모델과 TTS를 모두 선택해주세요.");
      return;
    }
    // TODO: 채팅방 생성 API 연동 후 생성된 ID로 이동
    // navigate(`/chat/${newChatId}`);
    console.log("채팅 시작", { selectedModel, selectedTTS, backgroundPreview: !!backgroundPreview });
  };
  const handleCancel = () => navigate("/chatrooms");
  const goHome = () => navigate("/");

  return (
    <div className="avatar-selection-container">
      {/* 헤더 */}
      <div className="raon-header">
        <div className="raon-logo" onClick={goHome} role="button">
          RAON
        </div>
        <div className="raon-nav-menu">
          <button onClick={() => navigate("/chatrooms")}>내 채팅방</button>
          <button className="active">새 채팅방</button>
          <button>요약</button>
          <button>노트</button>
          <button>메뉴</button>
        </div>
      </div>

      {/* 본문 */}
      <div className="avatar-selection-content">
        <h1 className="page-title">아바타 선택</h1>

        {/* 미리보기 */}
        <div className="preview-section">
          <div className="preview-container">
            {backgroundPreview && (
              <img className="background-preview" src={backgroundPreview} alt="배경" />
            )}
            <div className="model-preview">AI</div>
          </div>
          <div className="preview-label">미리보기</div>
          <div className="selected-info">
            <span className="info-badge">
              모델: {selectedModel ? selectedModel.split("-")[0] : "선택 안 됨"}
            </span>
            <span className="info-badge">TTS: {selectedTTS || "선택 안 됨"}</span>
          </div>
        </div>

        {/* 선택 그리드 */}
        <div className="selection-grid">
          {/* 모델 */}
          <div className="selection-card">
            <h3 className="card-title">
              <span className="card-icon">🤖</span>아바타 모델 선택
            </h3>
            <div className="custom-select">
              <button
                className={`select-button ${modelDropdownOpen ? "active" : ""}`}
                onClick={() => {
                  setModelDropdownOpen((v) => !v);
                  setTtsDropdownOpen(false);
                }}
                type="button"
              >
                <span>{selectedModel || "모델을 선택하세요"}</span>
                <span className="select-arrow">▼</span>
              </button>
              {modelDropdownOpen && (
                <div className="select-dropdown show">
                  {models.map((m) => (
                    <div
                      key={m}
                      className={`select-option ${selectedModel === m ? "selected" : ""}`}
                      onClick={() => handleSelectModel(m)}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TTS */}
          <div className="selection-card">
            <h3 className="card-title">
              <span className="card-icon">🎙️</span>음성(TTS) 선택
            </h3>
            <div className="custom-select">
              <button
                className={`select-button ${ttsDropdownOpen ? "active" : ""}`}
                onClick={() => {
                  setTtsDropdownOpen((v) => !v);
                  setModelDropdownOpen(false);
                }}
                type="button"
              >
                <span>{selectedTTS || "TTS를 선택하세요"}</span>
                <span className="select-arrow">▼</span>
              </button>
              {ttsDropdownOpen && (
                <div className="select-dropdown show">
                  {ttsTypes.map((t) => (
                    <div
                      key={t}
                      className={`select-option ${selectedTTS === t ? "selected" : ""}`}
                      onClick={() => handleSelectTTS(t)}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 배경 이미지 */}
          <div className="selection-card">
            <h3 className="card-title">
              <span className="card-icon">🖼️</span>배경 이미지
            </h3>
            <div
              className={`image-upload-area ${backgroundPreview ? "has-image" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              role="button"
            >
              {!backgroundPreview ? (
                <div className="upload-placeholder">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">파일 선택</div>
                  <div className="upload-subtext">선택된 파일 없음</div>
                </div>
              ) : (
                <img src={backgroundPreview} alt="미리보기" className="preview-image" />
              )}
            </div>
            {backgroundPreview && (
              <button className="remove-image-btn" onClick={handleRemoveImage} type="button">
                이미지 제거
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* 액션 */}
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={handleCancel} type="button">
            취소
          </button>
          <button
            className="btn btn-primary"
            onClick={handleStartChat}
            disabled={!selectedModel || !selectedTTS}
            type="button"
          >
            채팅 시작
          </button>
        </div>
      </div>
    </div>
  );
}

export default RaonAvatar;
