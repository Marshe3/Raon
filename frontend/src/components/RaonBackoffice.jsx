// src/components/RaonBackoffice.jsx
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import "./RaonBackoffice.css";

function RaonBackoffice() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedModelStyle, setSelectedModelStyle] = useState(null);
  const [selectedTTS, setSelectedTTS] = useState(null);
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [selectedSTT, setSelectedSTT] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // ✅ 경고 해결: useCallback으로 래핑
  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/raon/api/backoffice/configurations?t=" + Date.now(), {
        credentials: "include",
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`설정 로드 실패: ${response.status}`);
      const configData = await response.json();
      setConfig(configData);

      if (configData) {
        if (configData.prompts?.length > 0) setSelectedPrompt(configData.prompts[0]);
        if (configData.documents?.length > 0) setSelectedDocument(configData.documents[0]);
        if (configData.backgroundImages?.length > 0) setSelectedBackground(configData.backgroundImages[0]);
        if (configData.modelStyles?.length > 0) setSelectedModelStyle(configData.modelStyles[0]);
        if (configData.ttsModels?.length > 0) setSelectedTTS(configData.ttsModels[0]);
        if (configData.llmModels?.length > 0) setSelectedLLM(configData.llmModels[0]);
        if (configData.sttModels?.length > 0) setSelectedSTT(configData.sttModels[0]);
      }

      alert("✅ 설정 로드 성공!");
    } catch (error) {
      alert(`❌ 설정 로드 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleSaveConfiguration = () => {
    const configuration = {
      prompt: selectedPrompt,
      document: selectedDocument,
      background: selectedBackground,
      modelStyle: selectedModelStyle,
      tts: selectedTTS,
      llm: selectedLLM,
      stt: selectedSTT,
    };
    localStorage.setItem("raon_last_config", JSON.stringify(configuration));
    alert("✅ 설정이 저장되었습니다!");
  };

  const handleStartChat = async () => {
    if (!selectedPrompt || !selectedLLM || !selectedTTS) {
      alert("⚠️ 필수 항목을 선택해주세요.");
      return;
    }
    try {
      setLoading(true);
      const sessionRequest = {
        promptId: selectedPrompt.promptId,
        llmType: selectedLLM.name,
        ttsType: selectedTTS.name,
        documentId: selectedDocument?.documentId || null,
        sttType: selectedSTT?.name || null,
        modelStyle: selectedModelStyle?.name || null,
        backgroundImageId: selectedBackground?.backgroundImageId || null,
        agent: 1,
        paddingLeft: 0,
        paddingTop: 0,
        paddingHeight: 1,
        extraData: {},
      };
      const response = await fetch("/raon/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(sessionRequest),
      });
      if (!response.ok) throw new Error(`세션 생성 실패: ${response.status}`);
      const session = await response.json();

      console.log('🔍 Selected Prompt:', selectedPrompt);
      console.log('🔍 Intro Message:', selectedPrompt.introMessage);

      // 채팅 컴포넌트로 설정 정보 전달
      navigate(`/chat/${session.sessionId}`, {
        state: {
          sessionId: session.sessionId,
          sdkConfig: {
            promptId: selectedPrompt.promptId,
            introMessage: selectedPrompt.introMessage || '안녕하세요!',
            llmType: selectedLLM.name,
            ttsType: selectedTTS.name,
            sttType: selectedSTT?.name || null,
            modelStyle: selectedModelStyle?.name || null,
            documentId: selectedDocument?.documentId || null,
            backgroundImageId: selectedBackground?.backgroundImageId || null,
          },
          avatarName: selectedPrompt.name || '기본 챗봇',
          mode: 'backoffice'
        }
      });
    } catch (error) {
      alert(`채팅 시작 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!config) return <button onClick={loadConfiguration}>설정 다시 로드</button>;

  const dropdownMotion = {
    initial: { opacity: 0, y: -5, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -5, scale: 0.98 },
    transition: { duration: 0.15 },
  };

  return (
    <div className="backoffice-container" style={{ overflow: "visible", position: "relative", zIndex: 0 }}>
      <header className="backoffice-header">
        <div className="header-content">
          <h1 onClick={() => navigate("/")}>RAON 백오피스</h1>
        </div>
      </header>

      <main className="backoffice-main" style={{ overflow: "visible" }}>
        <div className="settings-panel" style={{ overflow: "visible" }}>
          <h2>PersoAI 설정 관리</h2>

          <div className="settings-grid" style={{ position: "relative", overflow: "visible" }}>
            <SettingSelect label="💬 프롬프트" required items={config.prompts} selected={selectedPrompt} setSelected={setSelectedPrompt} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="prompt" dropdownMotion={dropdownMotion} />
            <SettingSelect label="🧠 LLM 모델" required items={config.llmModels} selected={selectedLLM} setSelected={setSelectedLLM} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="llm" dropdownMotion={dropdownMotion} />
            <SettingSelect label="🎙️ TTS 모델" required items={config.ttsModels} selected={selectedTTS} setSelected={setSelectedTTS} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="tts" dropdownMotion={dropdownMotion} />
            <SettingSelect label="🎤 STT 모델" items={config.sttModels} selected={selectedSTT} setSelected={setSelectedSTT} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="stt" dropdownMotion={dropdownMotion} />
            <SettingSelect label="🤖 모델 스타일" items={config.modelStyles} selected={selectedModelStyle} setSelected={setSelectedModelStyle} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="model" dropdownMotion={dropdownMotion} />
            <SettingSelect label="📄 문서" items={config.documents} selected={selectedDocument} setSelected={setSelectedDocument} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="document" dropdownMotion={dropdownMotion} />
            <SettingSelect label="🖼️ 배경 이미지" items={config.backgroundImages} selected={selectedBackground} setSelected={setSelectedBackground} openDropdown={openDropdown} toggleDropdown={toggleDropdown} dropdownKey="background" dropdownMotion={dropdownMotion} />
          </div>

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={() => navigate("/")}>취소</button>
            <button className="btn btn-primary" onClick={handleSaveConfiguration}>설정 저장</button>
            <button className="btn btn-success" onClick={handleStartChat} disabled={!selectedPrompt || !selectedLLM || !selectedTTS}>💬 채팅 시작</button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* 드롭다운 컴포넌트 (변경 없음) */
function SettingSelect({
  label,
  required,
  items,
  selected,
  setSelected,
  openDropdown,
  toggleDropdown,
  dropdownKey,
  dropdownMotion,
}) {
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, flip: false });

  useLayoutEffect(() => {
    if (openDropdown === dropdownKey && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 260;
      const flip = spaceBelow < dropdownHeight;
      setDropdownPos({
        top: flip ? rect.top - dropdownHeight - 8 : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        flip,
      });
    }
  }, [openDropdown, dropdownKey]);

  const renderSelectedDisplay = () => {
    if (!selected) return `${label} 선택`;
    if (dropdownKey === "background") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={selected.imageUrl} alt="배경" style={{ width: 28, height: 28, borderRadius: "4px", objectFit: "cover" }} />
          <span>{selected.name || `배경 ${selected.backgroundImageId?.slice?.(0, 6)}`}</span>
        </div>
      );
    }
    if (dropdownKey === "document") {
      return selected.name || `문서 ${selected.documentId?.slice?.(0, 6)}`;
    }
    return selected.name;
  };

  const dropdown = (
    <AnimatePresence>
      {openDropdown === dropdownKey && (
        <motion.div
          {...dropdownMotion}
          className="select-dropdown"
          style={{
            position: "absolute",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
            maxHeight: "260px",
            overflowY: "auto",
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            transformOrigin: dropdownPos.flip ? "bottom center" : "top center",
          }}
        >
          {!required && (
            <div className={`select-option ${!selected ? "selected" : ""}`} onClick={() => { setSelected(null); toggleDropdown(null); }}>
              선택 안함
            </div>
          )}
          {items?.map((item) => {
            const isSelected =
              (dropdownKey === "background" && selected?.backgroundImageId === item.backgroundImageId) ||
              (dropdownKey === "document" && selected?.documentId === item.documentId) ||
              (dropdownKey !== "background" && dropdownKey !== "document" && selected?.name === item.name);

            return (
              <div
                key={item.name || item.id || item.backgroundImageId || item.documentId}
                className={`select-option ${isSelected ? "selected" : ""}`}
                onClick={() => { setSelected(item); toggleDropdown(null); }}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: isSelected ? "rgba(76, 175, 80, 0.1)" : "white",
                }}
              >
                {dropdownKey === "background" && (
                  <img
                    src={item.imageUrl}
                    alt="배경"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "4px",
                      objectFit: "cover",
                      border: isSelected ? "2px solid #4caf50" : "1px solid #ccc",
                    }}
                  />
                )}
                <span style={{ fontWeight: isSelected ? 600 : 400 }}>
                  {item.name || item.documentId?.slice?.(0, 6) || item.backgroundImageId?.slice?.(0, 6)}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="setting-card" style={{ position: "relative", overflow: "visible" }}>
      <h3>{label} {required && <span className="required">*</span>}</h3>
      <div className="custom-select" style={{ overflow: "visible" }}>
        <button
          ref={buttonRef}
          className={`select-button ${openDropdown === dropdownKey ? "active" : ""}`}
          onClick={() => toggleDropdown(dropdownKey)}
        >
          {renderSelectedDisplay()}
          <span className="arrow">▼</span>
        </button>
        {openDropdown === dropdownKey && ReactDOM.createPortal(dropdown, document.body)}
      </div>
    </div>
  );
}

export default RaonBackoffice;
