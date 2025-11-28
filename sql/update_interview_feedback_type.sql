-- 기존 interview_feedback 데이터의 interview_type을 "백엔드 개발자"로 업데이트
UPDATE interview_feedback
SET interview_type = '백엔드 개발자'
WHERE interview_type IS NULL OR interview_type = '';
