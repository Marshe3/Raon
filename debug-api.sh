#!/bin/bash

# PersoAI API 디버깅 스크립트

echo "🔍 PersoAI API 디버깅 시작..."
echo ""

BASE_URL="http://localhost:8086/raon"

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. API 설정 확인
echo "1️⃣ API 설정 확인..."
curl -s "${BASE_URL}/api/debug/config" | jq '.'
echo ""

# 2. 모든 엔드포인트 테스트
echo "2️⃣ 모든 엔드포인트 테스트..."
curl -s "${BASE_URL}/api/debug/test-all" | jq '.'
echo ""

# 3. Prompts 원본 응답
echo "3️⃣ Prompts 원본 응답..."
echo -e "${YELLOW}GET /api/v1/prompt/${NC}"
curl -s "${BASE_URL}/api/debug/raw/prompt" | jq '.body' | jq '.'
echo ""

# 4. Documents 원본 응답
echo "4️⃣ Documents 원본 응답..."
echo -e "${YELLOW}GET /api/v1/document/${NC}"
curl -s "${BASE_URL}/api/debug/raw/document" | jq '.body' | jq '.'
echo ""

# 5. Background Images 원본 응답
echo "5️⃣ Background Images 원본 응답..."
echo -e "${YELLOW}GET /api/v1/background_image/${NC}"
curl -s "${BASE_URL}/api/debug/raw/background_image" | jq '.body' | jq '.'
echo ""

# 6. Model Styles 원본 응답
echo "6️⃣ Model Styles 원본 응답..."
echo -e "${YELLOW}GET /api/core/v1/model_style/${NC}"
curl -s "${BASE_URL}/api/debug/raw/model_style" 2>&1
echo ""

# 7. AI Models 원본 응답
echo "7️⃣ AI Models 원본 응답..."
echo -e "${YELLOW}GET /api/v1/models/${NC}"
curl -s "${BASE_URL}/api/debug/raw/models" | jq '.body' | jq '.'
echo ""

# 8. 파싱된 데이터 확인
echo "8️⃣ 파싱된 Prompts..."
curl -s "${BASE_URL}/api/debug/parsed/prompts" | jq '.[0]'
echo ""

echo "9️⃣ 파싱된 Documents..."
curl -s "${BASE_URL}/api/debug/parsed/documents" | jq '.[0]'
echo ""

echo "🔟 파싱된 Backgrounds..."
curl -s "${BASE_URL}/api/debug/parsed/backgrounds" | jq '.[0]'
echo ""

echo "✅ 디버깅 완료!"