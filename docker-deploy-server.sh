#!/bin/bash

# 서버 배포 스크립트 (로컬에서 실행)

set -e

# 서버 정보
SERVER_USER="root"
SERVER_HOST="211.188.52.153"
SERVER_KEY="C:/Users/aischool/key/raon-key.pem"
DEPLOY_DIR="/root/raon"

echo "🚀 서버 배포 시작..."

# 서버에 프로젝트 디렉토리 생성
echo "📁 서버에 배포 디렉토리 생성 중..."
ssh -i "$SERVER_KEY" $SERVER_USER@$SERVER_HOST "mkdir -p $DEPLOY_DIR"

# 필요한 파일들 서버에 업로드
echo "📤 파일 업로드 중..."
rsync -avz --exclude 'node_modules' \
           --exclude 'build' \
           --exclude '.gradle' \
           --exclude 'target' \
           --exclude '.git' \
           --exclude '.env' \
           -e "ssh -i $SERVER_KEY" \
           . $SERVER_USER@$SERVER_HOST:$DEPLOY_DIR/

# .env 파일 별도 업로드 (존재하는 경우)
if [ -f .env ]; then
    echo "🔐 환경 변수 파일 업로드 중..."
    scp -i "$SERVER_KEY" .env $SERVER_USER@$SERVER_HOST:$DEPLOY_DIR/.env
fi

# 서버에서 배포 실행
echo "🐳 서버에서 Docker 배포 실행 중..."
ssh -i "$SERVER_KEY" $SERVER_USER@$SERVER_HOST "cd $DEPLOY_DIR && chmod +x deploy.sh && ./deploy.sh"

echo ""
echo "✅ 서버 배포 완료!"
echo "📊 로그 확인: ssh -i $SERVER_KEY $SERVER_USER@$SERVER_HOST 'cd $DEPLOY_DIR && docker compose logs -f'"
