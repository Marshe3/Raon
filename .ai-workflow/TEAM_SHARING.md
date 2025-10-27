# 👥 팀과 공유하기

## 개요

Gemini CLI + Claude Code 자동화 워크플로우를 **팀 전체가 사용**할 수 있도록 공유하는 방법입니다.

---

## 🎯 공유 방법 선택

### 방법 1: Git으로 공유 (권장)
- ✅ 버전 관리 가능
- ✅ 자동 동기화
- ✅ 팀원들이 쉽게 받을 수 있음

### 방법 2: 폴더 압축 공유
- ✅ Git 없이도 가능
- ✅ 빠른 공유
- ⚠️ 수동 업데이트 필요

---

## 📦 방법 1: Git으로 공유

### Step 1: .gitignore 설정

프로젝트 루트의 `.gitignore`에 추가:

```gitignore
# AI Workflow - 개인 분석 결과는 제외
.ai-workflow/gemini-output/

# AI Workflow - 임시/백업 파일 제외
.ai-workflow/scripts/*-old.bat
.ai-workflow/scripts/*-simple.bat
.ai-workflow/**/*.tmp
.ai-workflow/**/*.log
```

**이유:**
- ✅ `scripts/`, `templates/`, `.claude/` → Git에 포함 (공유)
- ❌ `gemini-output/` → Git에서 제외 (개인 분석 결과)

### Step 2: Git에 추가

```bash
# 현재 프로젝트 디렉토리에서
git add .ai-workflow/.gitignore
git add .ai-workflow/scripts/
git add .ai-workflow/templates/
git add .ai-workflow/*.md
git add .claude/

git commit -m "Add Gemini CLI + Claude Code automation workflow"
git push
```

### Step 3: 팀원이 받는 방법

팀원들은:
```bash
git pull
```

그러면 자동으로:
```
✅ .ai-workflow/ 폴더 다운로드
✅ .claude/ 폴더 다운로드
✅ 모든 스크립트와 템플릿
```

### Step 4: 팀원이 바로 사용

팀원들은 별도 설정 없이:

```cmd
cd .ai-workflow\scripts
gemini-daily.bat
```

```
/gemini-daily
```

**바로 작동합니다!** ✅

---

## 📁 방법 2: 폴더 압축 공유

### Step 1: 압축 파일 만들기

Windows 탐색기에서:

1. **필요한 폴더 선택:**
   ```
   .ai-workflow\
   ├── scripts\          ✅ 포함
   ├── templates\        ✅ 포함
   ├── *.md             ✅ 포함
   └── gemini-output\    ❌ 제외 (개인 결과)

   .claude\              ✅ 포함
   ```

2. **제외할 파일:**
   - `gemini-output/` 폴더 (개인 분석 결과)
   - `*-old.bat` (백업 파일)
   - `*.tmp`, `*.log` (임시 파일)

3. **압축:**
   ```
   선택된 항목 우클릭 → "압축" 또는 "Send to → Compressed folder"

   파일명: ai-workflow-setup.zip
   ```

### Step 2: 공유

압축 파일을 팀 채널로 공유:
- Slack
- Teams
- 이메일
- 공유 드라이브

### Step 3: 팀원이 설치

팀원들은:

1. `ai-workflow-setup.zip` 다운로드
2. 프로젝트 루트에 압축 해제
3. 바로 사용!

```cmd
cd .ai-workflow\scripts
gemini-daily.bat
```

---

## 📋 팀원을 위한 설정 가이드

팀원들에게 다음 메시지와 함께 공유하세요:

```markdown
# 🤖 AI 자동화 워크플로우 설치 완료!

## 시작하기 (3분)

### 1. Gemini CLI 설치 확인
터미널에서:
```cmd
gemini --version
```

설치 안 되어 있다면:
- [Gemini CLI 설치 가이드](https://github.com/google/generative-ai-cli)

### 2. 첫 실행
프로젝트 폴더에서:
```cmd
cd .ai-workflow\scripts
gemini-daily.bat
```

### 3. Claude Code 사용
VSCode에서:
```
/gemini-daily
```

## 자세한 사용법
- `.ai-workflow/START_HERE.md` 읽기
- `.ai-workflow/HOW_TO_USE.md` 참고

## 도움이 필요하면
[팀장 이름]에게 연락주세요!
```

---

## 🔄 업데이트 공유하기

### Git 사용 시 (자동)

**당신이 워크플로우를 개선했을 때:**
```bash
# 템플릿 수정 후
git add .ai-workflow/templates/
git commit -m "Improve daily analysis template"
git push
```

**팀원들이 받는 법:**
```bash
git pull
```

→ 자동으로 최신 버전 받음! ✅

### 압축 파일 사용 시 (수동)

**업데이트된 버전 공유:**
```
1. 새 압축 파일 생성
   파일명: ai-workflow-setup-v2.zip

2. 팀 채널에 공유
   메시지: "업데이트됨: 템플릿 개선"

3. 팀원들이 다시 압축 해제
```

---

## 🎯 팀 사용 시나리오

### 시나리오 1: 코드 리뷰 표준화

**전체 팀이 동일한 기준으로 리뷰:**

```cmd
# 모든 팀원이 동일한 템플릿 사용
gemini-review.bat "PR-123"
```

**장점:**
- 일관된 코드 품질 기준
- 놓치는 이슈 감소
- 리뷰 시간 단축

### 시나리오 2: 데일리 스탠드업 준비

**아침 스탠드업 전:**

```
09:00 - 각자 gemini-daily.bat 실행
09:03 - Claude로 자동 개선
09:10 - 스탠드업에서 개선 사항 공유
```

**팀 효과:**
- 매일 코드 품질 향상
- 기술 부채 조기 발견
- 팀 전체 코드 일관성

### 시나리오 3: 신입 온보딩

**신입 개발자가 팀 합류:**

```
1. Git clone
2. .ai-workflow와 .claude 자동 다운로드
3. START_HERE.md 따라하기
4. 바로 팀 워크플로우 사용!
```

**온보딩 시간 단축:**
- 코드 스타일 자동 학습
- 베스트 프랙티스 자동 적용
- 실수 조기 방지

---

## 🔐 보안 고려사항

### 공유해도 되는 것 ✅
- 스크립트 (`.bat` 파일)
- 템플릿 (`.txt` 파일)
- 슬래시 커맨드 (`.md` 파일)
- 문서 파일들

### 공유하면 안 되는 것 ❌
- `gemini-output/` (개인 분석 결과)
- API 키 (만약 스크립트에 포함되어 있다면 제거)
- 민감한 분석 결과

### API 키 관리

각 팀원이 개별적으로 설정:

```bash
# 환경 변수로 관리 (권장)
GEMINI_API_KEY=your-key-here

# 또는 Gemini CLI 설정으로 관리
gemini config set api_key "your-key"
```

**절대 Git에 API 키를 커밋하지 마세요!**

---

## 📊 팀 사용 통계 (선택사항)

팀 전체의 사용 현황을 추적하려면:

### 간단한 로그 추가

`.ai-workflow/scripts/gemini-daily.bat`에 추가:

```batch
@echo off
REM 사용 로그 (선택사항)
echo [%date% %time%] %USERNAME% executed daily analysis >> ..\usage.log
```

### 통계 확인

```cmd
type .ai-workflow\usage.log
```

**결과 예시:**
```
[2025-10-17 09:00] Alice executed daily analysis
[2025-10-17 09:05] Bob executed daily analysis
[2025-10-17 09:10] Charlie executed daily analysis
```

---

## 💡 팀 커스터마이징

### 팀 고유 템플릿 만들기

**예시: 회사 코딩 컨벤션 추가**

`.ai-workflow/templates/daily-analysis.txt`:

```
### 분석 항목
1. 코드 품질 분석
2. 회사 코딩 컨벤션 준수 여부 ← 추가
   - 함수명: camelCase
   - 클래스명: PascalCase
   - 들여쓰기: 2칸 스페이스
3. 보안 분석
...
```

**모든 팀원이 동일한 기준으로 체크!**

---

## 🎁 보너스: 팀 슬랙 통합 (고급)

분석 결과를 Slack에 자동 알림:

`.ai-workflow/scripts/notify-slack.bat`:

```batch
@echo off
REM Gemini 분석 완료 후 Slack 알림

set SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
set ANALYSIS_FILE=..\gemini-output\daily-analysis\latest.md

curl -X POST %SLACK_WEBHOOK% ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"일일 분석 완료! 결과: %ANALYSIS_FILE%\"}"
```

**팀 전체가 분석 완료를 알 수 있습니다!**

---

## ❓ FAQ

### Q1: 팀원마다 다른 OS를 쓴다면?
**A:**
- Windows: `.bat` 스크립트 사용
- Mac/Linux: `.sh` 스크립트 제공 (동일한 로직)

### Q2: 팀원이 Gemini CLI가 없다면?
**A:**
- Gemini CLI 설치 가이드 공유
- 또는 팀 서버에서 중앙 집중식으로 실행

### Q3: 분석 결과를 팀과 공유하고 싶다면?
**A:**
- `gemini-output/` 폴더의 특정 파일만 Slack/Teams에 공유
- 또는 별도의 공유 폴더 생성

### Q4: 팀 규모가 크다면?
**A:**
- 서버에서 일괄 분석 후 결과 배포
- CI/CD 파이프라인에 통합

---

## 🎉 완료!

**이제 팀 전체가 AI 자동화를 사용할 수 있습니다!**

### 체크리스트:

- [ ] Git에 `.ai-workflow`와 `.claude` 추가
- [ ] `.gitignore`에 `gemini-output/` 제외
- [ ] 팀원들에게 사용 가이드 공유
- [ ] 각자 Gemini CLI 설치 확인
- [ ] 첫 팀 분석 실행 성공

**Happy Team Coding!** 🚀👥
