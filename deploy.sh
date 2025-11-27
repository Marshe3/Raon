#!/bin/bash

# Raon Docker 배포 스크립트

set -e

echo "🚀 Raon Docker 배포 시작..."

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다. .env.example을 참고해서 .env 파일을 생성하세요."
    exit 1
fi

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너 중지 중..."
docker compose down

# 최신 코드 pull (선택사항)
if [ "$1" == "--pull" ]; then
    echo "📥 최신 코드 가져오는 중..."
    git pull origin main
fi

# 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker compose build --no-cache

# 컨테이너 시작
echo "▶️  컨테이너 시작 중..."
docker compose up -d

# 상태 확인
echo "✅ 배포 완료! 컨테이너 상태 확인 중..."
sleep 5
docker compose ps

echo ""
echo "📊 로그 확인: docker compose logs -f"
echo "🔍 상태 확인: docker compose ps"
echo "⏹️  중지: docker compose down"
echo ""
echo "🎉 배포가 완료되었습니다!"
