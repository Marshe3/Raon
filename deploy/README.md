# Raon 프로젝트 배포 가이드

이 디렉토리에는 Raon 프로젝트를 서버에 배포하기 위한 설정 파일과 스크립트가 포함되어 있습니다.

## 📁 파일 설명

- `deploy.sh` - 자동 배포 스크립트
- `raon-backend.service` - systemd 서비스 파일
- `nginx-raon.conf` - Nginx 설정 파일
- `.env.template` - 환경 변수 템플릿

## 🚀 배포 방법

### 1단계: 환경 변수 설정

```bash
# .env.template을 복사하여 .env 파일 생성
cp deploy/.env.template .env

# .env 파일 편집 (실제 값으로 변경)
vi .env
```

**필수 환경 변수:**
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` - 데이터베이스 접속 정보
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth2
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET` - Kakao OAuth2
- `JWT_SECRET` - JWT 암호화 키 (최소 32자)
- `ENCRYPTION_PASSWORD`, `ENCRYPTION_SALT` - 암호화 키
- `PERSOAI_API_KEY` - PersoAI API 키

### 2단계: 배포 스크립트 실행

```bash
# 스크립트에 실행 권한 부여
chmod +x deploy/deploy.sh

# 배포 실행
./deploy/deploy.sh
```

배포 스크립트는 다음 작업을 자동으로 수행합니다:
1. Git 최신 코드 업데이트
2. 백엔드 빌드 (Gradle)
3. 프론트엔드 빌드 (npm)
4. systemd 서비스 파일 설치
5. Nginx 설정 파일 설치
6. 서비스 시작 및 활성화

### 3단계: 배포 확인

```bash
# 백엔드 서비스 상태 확인
sudo systemctl status raon-backend

# 백엔드 로그 확인
sudo journalctl -u raon-backend -f

# Nginx 상태 확인
sudo systemctl status nginx
```

## 🔧 수동 배포 (문제 발생 시)

자동 배포 스크립트에 문제가 있을 경우 수동으로 배포할 수 있습니다.

### 백엔드 빌드

```bash
cd /opt/Raon
./gradlew clean build -x test
```

### 프론트엔드 빌드

```bash
cd /opt/Raon/frontend
npm install
npm run build
```

### systemd 서비스 설정

```bash
# 서비스 파일 복사
sudo cp deploy/raon-backend.service /etc/systemd/system/

# 데몬 리로드
sudo systemctl daemon-reload

# 서비스 시작
sudo systemctl start raon-backend
sudo systemctl enable raon-backend
```

### Nginx 설정

```bash
# 설정 파일 복사
sudo cp deploy/nginx-raon.conf /etc/nginx/sites-available/raon

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/raon /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 📊 서비스 관리 명령어

### 백엔드 서비스

```bash
# 시작
sudo systemctl start raon-backend

# 중지
sudo systemctl stop raon-backend

# 재시작
sudo systemctl restart raon-backend

# 상태 확인
sudo systemctl status raon-backend

# 로그 확인
sudo journalctl -u raon-backend -f
```

### Nginx

```bash
# 시작
sudo systemctl start nginx

# 중지
sudo systemctl stop nginx

# 재시작
sudo systemctl restart nginx

# 설정 리로드 (다운타임 없음)
sudo systemctl reload nginx

# 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/raon-error.log
```

## 🌐 접속 URL

- **프론트엔드**: http://211.188.52.153
- **백엔드 API**: http://211.188.52.153/raon/api

## ⚠️ 문제 해결

### 백엔드가 시작되지 않는 경우

```bash
# 로그 확인
sudo journalctl -u raon-backend -n 100

# .env 파일 확인
cat /opt/Raon/.env

# JAR 파일 존재 확인
ls -lh /opt/Raon/build/libs/
```

### Nginx 설정 오류

```bash
# 설정 테스트
sudo nginx -t

# 에러 로그 확인
sudo tail -n 50 /var/log/nginx/error.log
```

### 포트가 이미 사용 중인 경우

```bash
# 8086 포트 사용 프로세스 확인
sudo lsof -i :8086

# 80 포트 사용 프로세스 확인
sudo lsof -i :80
```
