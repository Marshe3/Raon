#!/bin/bash

# Raon 프로젝트 배포 스크립트
echo "=========================================="
echo "Raon 프로젝트 배포 시작"
echo "=========================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 에러 발생 시 스크립트 중단
set -e

# 작업 디렉토리 확인
if [ ! -d "/opt/Raon" ]; then
    echo -e "${RED}❌ /opt/Raon 디렉토리가 없습니다.${NC}"
    exit 1
fi

cd /opt/Raon

# 1. Git 최신 코드 받기 (선택사항)
echo -e "\n${YELLOW}📥 Git 최신 코드 확인 중...${NC}"
if [ -d ".git" ]; then
    git pull
    echo -e "${GREEN}✅ Git pull 완료${NC}"
else
    echo -e "${YELLOW}⚠️  Git 저장소가 아닙니다. 건너뜁니다.${NC}"
fi

# 2. 환경 변수 파일 확인
echo -e "\n${YELLOW}🔍 환경 변수 파일 확인 중...${NC}"
if [ ! -f "/opt/Raon/.env" ]; then
    echo -e "${RED}❌ .env 파일이 없습니다.${NC}"
    echo -e "${YELLOW}deploy/.env.template을 복사하여 /opt/Raon/.env를 생성하고 값을 설정하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env 파일 확인 완료${NC}"

# 3. Java 버전 확인
echo -e "\n${YELLOW}☕ Java 버전 확인 중...${NC}"
java -version
echo -e "${GREEN}✅ Java 확인 완료${NC}"

# 4. 백엔드 빌드
echo -e "\n${YELLOW}🏗️  백엔드 빌드 중...${NC}"
./gradlew clean build -x test
echo -e "${GREEN}✅ 백엔드 빌드 완료${NC}"

# 5. Node.js 확인
echo -e "\n${YELLOW}📦 Node.js 확인 중...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
    exit 1
fi
node --version
npm --version
echo -e "${GREEN}✅ Node.js 확인 완료${NC}"

# 6. 프론트엔드 빌드
echo -e "\n${YELLOW}🎨 프론트엔드 빌드 중...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✅ 프론트엔드 빌드 완료${NC}"

# 7. systemd 서비스 파일 설치
echo -e "\n${YELLOW}⚙️  systemd 서비스 파일 설치 중...${NC}"
if [ -f "deploy/raon-backend.service" ]; then
    sudo cp deploy/raon-backend.service /etc/systemd/system/
    echo -e "${GREEN}✅ systemd 서비스 파일 설치 완료${NC}"
else
    echo -e "${RED}❌ deploy/raon-backend.service 파일이 없습니다.${NC}"
    exit 1
fi

# 8. Nginx 설정 파일 설치
echo -e "\n${YELLOW}🌐 Nginx 설정 파일 설치 중...${NC}"
if [ -f "deploy/nginx-raon.conf" ]; then
    sudo cp deploy/nginx-raon.conf /etc/nginx/sites-available/raon

    # sites-enabled 심볼릭 링크 생성
    if [ ! -L "/etc/nginx/sites-enabled/raon" ]; then
        sudo ln -s /etc/nginx/sites-available/raon /etc/nginx/sites-enabled/
    fi

    # Nginx 설정 테스트
    sudo nginx -t
    echo -e "${GREEN}✅ Nginx 설정 파일 설치 완료${NC}"
else
    echo -e "${YELLOW}⚠️  deploy/nginx-raon.conf 파일이 없습니다. Nginx 설정을 건너뜁니다.${NC}"
fi

# 9. systemd 데몬 리로드
echo -e "\n${YELLOW}🔄 systemd 데몬 리로드 중...${NC}"
sudo systemctl daemon-reload
echo -e "${GREEN}✅ systemd 데몬 리로드 완료${NC}"

# 10. 백엔드 서비스 재시작
echo -e "\n${YELLOW}🚀 백엔드 서비스 재시작 중...${NC}"
sudo systemctl restart raon-backend
sudo systemctl enable raon-backend
echo -e "${GREEN}✅ 백엔드 서비스 시작 완료${NC}"

# 11. Nginx 재시작
echo -e "\n${YELLOW}🌐 Nginx 재시작 중...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx
echo -e "${GREEN}✅ Nginx 재시작 완료${NC}"

# 12. 서비스 상태 확인
echo -e "\n${YELLOW}📊 서비스 상태 확인 중...${NC}"
echo -e "\n--- 백엔드 서비스 상태 ---"
sudo systemctl status raon-backend --no-pager

echo -e "\n--- Nginx 상태 ---"
sudo systemctl status nginx --no-pager

# 13. 배포 완료
echo -e "\n=========================================="
echo -e "${GREEN}🎉 배포가 완료되었습니다!${NC}"
echo -e "=========================================="
echo -e "\n📍 접속 URL:"
echo -e "  - 프론트엔드: ${GREEN}http://211.188.52.153${NC}"
echo -e "  - 백엔드: ${GREEN}http://211.188.52.153/raon/api${NC}"
echo -e "\n📝 로그 확인:"
echo -e "  - 백엔드: ${YELLOW}sudo journalctl -u raon-backend -f${NC}"
echo -e "  - Nginx: ${YELLOW}sudo tail -f /var/log/nginx/raon-error.log${NC}"
echo -e "=========================================="
