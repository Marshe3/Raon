-- Test User 생성 (user_id = 1)
INSERT IGNORE INTO user (user_id, email, nickname, social_type, social_id, join_date, last_login, created_at, updated_at)
VALUES (1, 'test@test.com', '테스트유저', 'LOCAL', 'test123', NOW(), NOW(), NOW(), NOW());

-- 샘플 챗봇 데이터 (6개 프리셋 아바타)
INSERT IGNORE INTO chatbot (chatbot_name, description, model_style, tts_type, llm_type, stt_type, prompt_id, document_id, is_active, is_public, created_at, updated_at)
VALUES
('밝은 친구', '항상 긍정적이고 밝은 에너지로 당신의 하루를 밝게 만들어줄 친구', 'chaehee_livechat-front-white_suit-natural_loop', 'chaehee', 'azure-gpt-4o', 'whisper', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW()),
('차분한 조언자', '신중하고 깊이 있는 대화로 고민을 함께 나누고 해결책을 찾아가요', 'chaehee_livechat-front-white_suit-natural_loop', 'yuri', 'azure-gpt-4o', 'whisper', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW()),
('열정적인 동기부여자', '목표 달성을 응원하는 에너지로 당신의 꿈을 향한 여정을 함께 해요', 'chaehee_livechat-front-white_suit-natural_loop', 'eilee', 'azure-gpt-4o', 'whisper', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW()),
('따뜻한 위로자', '공감과 위로의 대화로 힘든 순간에 따뜻하게 안아줄게요', 'chaehee_livechat-front-white_suit-natural_loop', 'yuri', 'azure-gpt-4o', 'whisper', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW()),
('재미있는 친구', '유머러스하고 즐거운 대화로 웃음과 재미를 선물할게요', 'chaehee_livechat-front-white_suit-natural_loop', 'yuri', 'azure-gpt-4o', 'whisper', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW()),
('지적인 탐구자', '호기심 많고 지식이 풍부하여 흥미로운 주제를 함께 탐구해요', 'chaehee_livechat-front-white_suit-natural_loop', 'chaehee', 'azure-gpt-4o', 'whisper', 'plp-275c194ca6b8d746d6c25a0dec3c3fdb', 'pld-c2104dc3d8165c42f60bcf8217c19bc8', TRUE, TRUE, NOW(), NOW());
