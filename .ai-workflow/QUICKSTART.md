# 🚀 Gemini CLI + Claude Code 빠른 시작 가이드

## ✅ 전제 조건
- Gemini CLI 설치 완료 (gemini-2.5-pro 모델 사용)
- Claude Code 설치 완료

## 📝 5분 안에 시작하기

### 1. 일일 분석 실행 (첫 번째 실행)

```cmd
cd .ai-workflow\scripts
gemini-daily.bat
```

**실행 결과:**
- 📁 `.ai-workflow/gemini-output/daily-analysis/latest.md` 파일 생성
- 🤖 Gemini가 프로젝트 분석 완료 (2-3분 소요)
- ✅ 분석 보고서 저장

### 2. Claude Code에서 결과 확인

Claude Code를 열고:

```
/gemini-daily
```

**동작:**
- 📖 최신 분석 보고서 자동 읽기
- 🔍 액션 아이템 추출
- ⚡ 자동 수정 가능한 항목 처리
- 📋 수동 검토 필요 항목 정리

### 3. 실제 사용 예시

#### 분석 결과 예시:
```markdown
## 요약
- Backend: Spring Boot 3.4.10 / Spring Security, JWT
- Frontend: React 19.2.0 / TypeScript
- 전체 파일 수: 79개

## 주요 발견 사항
1. 프로젝트가 초기 단계
2. API 클라이언트 부재 (axios 미설치)
3. 상태 관리 라이브러리 없음
4. Mock 데이터 잘 활용 중

## Claude Code 액션 제안
- 백엔드 CRUD 구현
- axios 추가 및 API 연동
- Zustand 상태 관리 추가
- 라우팅 설정
```

#### Claude가 수행할 작업:
```
/gemini-daily

✅ 분석 보고서를 읽었습니다.

### 자동 처리 가능 항목:
1. ✅ axios 라이브러리 추가
2. ✅ Zustand 설치 및 설정
3. ✅ 기본 라우팅 구조 생성

### 수동 검토 필요:
1. ⚠️ CRUD API 설계 - 비즈니스 로직 확인 필요
2. ⚠️ 인증 플로우 - 보안 정책 결정 필요

작업을 시작할까요?
```

## 🎯 주요 워크플로우

### 매일 아침 루틴
```cmd
# 1. Gemini 일일 분석
gemini-daily.bat

# 2. Claude Code 열기
# 3. 결과 확인 및 처리
/gemini-daily
```

### 기술 선택이 필요할 때
```cmd
# 1. Gemini 리서치
gemini-research.bat "상태관리: Redux vs Zustand vs Jotai"

# 2. Claude Code에서 구현
/gemini-research
```

### 코드 리뷰가 필요할 때
```cmd
# 1. Gemini 코드 리뷰
gemini-review.bat "최근변경사항"

# 2. Claude Code에서 수정
/gemini-review
```

## 📊 현재 프로젝트 적용 예시

### 1. 일일 분석으로 발견한 이슈 자동 수정

**Gemini 발견:**
```markdown
## Claude Code 액션 아이템
- [ ] board-front/package.json - axios 라이브러리 추가
- [ ] board-front/src/apis/index.ts - API 클라이언트 설정
```

**Claude 실행:**
```
/gemini-daily

→ axios 설치 완료
→ API 클라이언트 기본 구조 생성
→ 환경 변수 설정 파일 추가
```

### 2. 리서치 결과 기반 구현

**리서치 실행:**
```cmd
gemini-research.bat "Spring Boot 게시판 페이징 구현 방법"
```

**Claude 실행:**
```
/gemini-research

→ Pageable 인터페이스 적용
→ Repository에 페이징 쿼리 추가
→ Controller에 페이징 파라미터 추가
→ 프론트엔드 페이지네이션 컴포넌트 생성
```

## 💡 팁

### 효율적인 사용법
1. **아침에 일일 분석** - 자동으로 이슈 발견
2. **Claude가 간단한 것 처리** - 라이브러리 추가, 설정 파일 등
3. **사람은 중요한 결정** - 아키텍처, 보안, 비즈니스 로직

### 시간 절약
- Gemini: 대규모 분석 (한 번에 전체 프로젝트)
- Claude: 빠른 실행 (즉시 코드 수정)

### 비용 최적화
- Gemini: 하루 1-2회만 실행
- Claude: 실시간 작업에 활용

## 🔧 커스터마이징

### 분석 주기 변경
Windows Task Scheduler에서 gemini-daily.bat 실행 시간 조정:
- 오전 9시: 출근 후 자동 분석
- 오후 6시: 퇴근 전 자동 분석

### 프롬프트 수정
`.ai-workflow/templates/` 폴더의 템플릿 파일 수정

### 슬래시 커맨드 수정
`.claude/commands/` 폴더의 커맨드 파일 수정

## 🐛 문제 해결

### Gemini CLI 오류
```cmd
# 모델 확인
gemini --version

# 기본 테스트
echo "테스트" | gemini -m gemini-2.5-pro
```

### Claude Code가 파일을 못 찾음
```cmd
# 파일 존재 확인
dir .ai-workflow\gemini-output\daily-analysis\latest.md
```

### 한글 깨짐
- Windows 콘솔 인코딩 설정: `chcp 65001`
- 파일 저장 시 UTF-8 사용

## 📚 다음 단계

1. [전체 사용 가이드](.ai-workflow/USAGE.md) 읽기
2. [워크플로우 개요](.ai-workflow/README.md) 확인
3. 프롬프트 템플릿 커스터마이징
4. 자동화 일정 설정

---

**시작 준비 완료!** 이제 `gemini-daily.bat`를 실행하고 `/gemini-daily`로 결과를 확인하세요! 🎉
