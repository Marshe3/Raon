-- Test User 생성 (user_id = 1)
INSERT IGNORE INTO user (user_id, email, nickname, social_type, social_id, join_date, last_login, created_at, updated_at)
VALUES (1, 'test@test.com', '테스트유저', 'LOCAL', 'test123', NOW(), NOW(), NOW(), NOW());

-- Test Chatbot 생성 (chatbot_id = 1)
INSERT IGNORE INTO chatbot (chatbot_id, chatbot_name, description, model_style, tts_type, llm_type, stt_type, prompt_id, document_id, is_active, is_public, created_at, updated_at)
VALUES (1, '기본 챗봇', 'PersoAI 기본 챗봇', 'chaehee_livechat-front-white_suit-natural_loop', 'yuri', 'azure-gpt-4o', 'default', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE
llm_type = 'azure-gpt-4o',
model_style = 'chaehee_livechat-front-white_suit-natural_loop',
prompt_id = 'plp-275c194ca6b8d746d6c25a0dec3c3fdb',
document_id = 'pld-c2104dc3d8165c42f60bcf8217c19bc8';
