-- MCP 서버 테이블 추가
-- 챗봇별로 사용할 MCP 서버 목록을 저장

CREATE TABLE IF NOT EXISTS chatbot_mcp_server (
    mcp_server_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chatbot_id BIGINT NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chatbot_id) REFERENCES chatbot(chatbot_id) ON DELETE CASCADE,
    INDEX idx_chatbot_id (chatbot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
