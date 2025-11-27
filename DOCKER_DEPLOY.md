# 🐳 Raon Docker 배포 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [로컬 환경 설정](#로컬-환경-설정)
3. [서버 배포](#서버-배포)
4. [배포 후 확인](#배포-후-확인)
5. [문제 해결](#문제-해결)

---

## 🎯 사전 준비

### 필수 소프트웨어
- Docker (v20.10 이상)
- Docker Compose (v2.0 이상)

### 서버 확인
```bash
# Docker 설치 확인
docker --version
docker compose version
```

---

## ⚙️ 로컬 환경 설정

### 1. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 실제 값을 입력합니다:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=강력한-루트-비밀번호
MYSQL_DATABASE=raon
MYSQL_USER=raon_user
MYSQL_PASSWORD=강력한-DB-비밀번호

# OAuth2 Configuration
OAUTH_REDIRECT_BASE_URL=http://211.188.52.153
GOOGLE_CLIENT_ID=실제-구글-클라이언트-ID
GOOGLE_CLIENT_SECRET=실제-구글-시크릿
KAKAO_CLIENT_ID=실제-카카오-클라이언트-ID
KAKAO_CLIENT_SECRET=실제-카카오-시크릿

# CORS Configuration
ALLOWED_ORIGINS=http://211.188.52.153,http://localhost:3000

# Frontend URL
FRONTEND_URL=http://211.188.52.153

# JWT Secret
JWT_SECRET=최소-32자-이상의-안전한-시크릿-키
```

### 2. 로컬 테스트 (선택사항)

```bash
# 빌드 및 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 중지
docker compose down
```

---

## 🚀 서버 배포

### 방법 1: 자동 배포 스크립트 사용 (권장)

```bash
# 배포 스크립트에 실행 권한 부여
chmod +x docker-deploy-server.sh

# 서버에 배포
./docker-deploy-server.sh
```

### 방법 2: 수동 배포

#### 1) 서버에 파일 업로드

```bash
# rsync를 사용한 파일 전송
rsync -avz --exclude 'node_modules' \
           --exclude 'build' \
           --exclude '.gradle' \
           -e "ssh -i C:/Users/aischool/key/raon-key.pem" \
           . root@211.188.52.153:/root/raon/
```

#### 2) SSH로 서버 접속

```bash
ssh -i C:/Users/aischool/key/raon-key.pem root@211.188.52.153
```

#### 3) 서버에서 배포

```bash
cd /root/raon

# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ 배포 후 확인

### 컨테이너 상태 확인

```bash
docker compose ps
```

예상 출력:
```
NAME              IMAGE              STATUS         PORTS
raon-backend      raon-backend       Up 2 minutes   0.0.0.0:8080->8080/tcp
raon-frontend     raon-frontend      Up 2 minutes   0.0.0.0:80->80/tcp
raon-mysql        mysql:8.0          Up 2 minutes   0.0.0.0:3306->3306/tcp
```

### 로그 확인

```bash
# 전체 로그
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### 헬스 체크

```bash
# Backend 헬스 체크
curl http://localhost:8080/actuator/health

# Frontend 접속 확인
curl http://localhost/
```

### 브라우저 접속

- **Frontend**: http://211.188.52.153
- **Backend API**: http://211.188.52.153:8080

---

## 🔧 Docker 명령어 모음

### 기본 명령어

```bash
# 컨테이너 시작
docker compose up -d

# 컨테이너 중지
docker compose down

# 컨테이너 재시작
docker compose restart

# 이미지 재빌드
docker compose build --no-cache

# 볼륨 포함 전체 삭제
docker compose down -v
```

### 디버깅 명령어

```bash
# 컨테이너 접속
docker exec -it raon-backend /bin/sh
docker exec -it raon-frontend /bin/sh

# 데이터베이스 접속
docker exec -it raon-mysql mysql -u raon_user -p

# 리소스 사용량 확인
docker stats
```

---

## 🐛 문제 해결

### 1. 컨테이너가 시작되지 않을 때

```bash
# 로그 확인
docker compose logs

# 특정 서비스 재시작
docker compose restart backend
```

### 2. 데이터베이스 연결 오류

```bash
# MySQL 컨테이너 헬스 확인
docker compose ps mysql

# MySQL 로그 확인
docker compose logs mysql

# 네트워크 확인
docker network inspect raon_raon-network
```

### 3. 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인 (Linux)
netstat -tulpn | grep :8080

# 기존 프로세스 종료 후 재시작
docker compose down
docker compose up -d
```

### 4. 이미지 빌드 실패

```bash
# Docker 캐시 클리어
docker builder prune -a

# 재빌드
docker compose build --no-cache
```

### 5. 디스크 공간 부족

```bash
# 사용하지 않는 리소스 정리
docker system prune -a --volumes
```

---

## 🔄 업데이트 배포

### 코드 변경 후 재배포

```bash
# 서버에서 실행
cd /root/raon
git pull origin main
./deploy.sh --pull
```

### 특정 서비스만 재배포

```bash
# Backend만 재빌드
docker compose build backend
docker compose up -d backend

# Frontend만 재빌드
docker compose build frontend
docker compose up -d frontend
```

---

## 📊 모니터링

### 실시간 로그 모니터링

```bash
# 모든 서비스
docker compose logs -f --tail=100

# Backend만
docker compose logs -f backend --tail=100
```

### 리소스 모니터링

```bash
# 실시간 리소스 사용량
docker stats

# 디스크 사용량
docker system df
```

---

## 🔒 보안 권장사항

1. **.env 파일 보안**
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - 강력한 비밀번호 사용
   - 정기적으로 비밀번호 변경

2. **방화벽 설정**
   - 필요한 포트만 개방 (80, 443, 8080)
   - SSH 포트 변경 권장

3. **SSL/TLS 적용**
   - 운영 환경에서는 반드시 HTTPS 사용
   - Let's Encrypt 인증서 사용 권장

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 확인: `docker compose logs -f`
2. 컨테이너 상태: `docker compose ps`
3. 환경 변수 확인: `.env` 파일

---

## 📝 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Spring Boot Docker 가이드](https://spring.io/guides/topicals/spring-boot-docker/)
