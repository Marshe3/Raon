# AI Workflow: Gemini CLI + Claude Code

## ✅ 설정 완료! 바로 사용 가능

**Gemini CLI (gemini-2.5-pro)** 와 **Claude Code** 를 연동한 자동화 워크플로우가 구축되었습니다.

### 🎯 처음 사용하시나요?
**👉 [START_HERE.md](START_HERE.md) ← 여기서 시작하세요!** (3단계, 5분)

### 📚 상세 가이드
1. **⭐ [HOW_TO_USE.md](HOW_TO_USE.md)** - 실제 사용 방법 (시나리오별 설명)
2. **🚀 [QUICKSTART.md](QUICKSTART.md)** - 빠른 시작 가이드
3. **✅ [SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - 설정 완료 내역
4. **📖 [USAGE.md](USAGE.md)** - 전체 사용 가이드

### 🔄 확장 가이드
5. **📦 [INSTALL_TO_NEW_PROJECT.md](INSTALL_TO_NEW_PROJECT.md)** - 다른 프로젝트에 설치
6. **👥 [TEAM_SHARING.md](TEAM_SHARING.md)** - 팀과 공유하기

## 💡 개념

### 역할 분담
- **Gemini CLI (gemini-2.5-pro)**: 대규모 분석, 리서치, 종합 리뷰 (하루 1-2회)
- **Claude Code**: 즉시 코드 수정, 디버깅, 테스트 작성 (실시간)

### 워크플로우
```
Gemini 분석 → 파일 저장 → Claude 읽기 → 자동 수정
```

## 디렉토리 구조

```
.ai-workflow/
├── gemini-output/          # Gemini CLI 분석 결과 저장
│   ├── daily-analysis/     # ✅ 일일 분석 결과
│   ├── research/           # ✅ 리서치 결과
│   └── code-review/        # ✅ 코드 리뷰 결과
├── scripts/                # ✅ 자동화 스크립트 (Windows)
│   ├── gemini-daily.bat    # 일일 분석 (gemini-2.5-pro)
│   ├── gemini-research.bat # 리서치
│   └── gemini-review.bat   # 코드 리뷰
├── templates/              # ✅ 프롬프트 템플릿
│   ├── daily-analysis.txt
│   ├── research.txt
│   └── code-review.txt
├── README.md               # 📄 이 파일
├── QUICKSTART.md           # 🚀 빠른 시작
├── USAGE.md                # 📚 상세 가이드
└── SETUP_COMPLETE.md       # ✅ 완료 내역

.claude/commands/           # ✅ Claude Code 슬래시 커맨드
├── gemini-daily.md
├── gemini-research.md
└── gemini-review.md
```

## 🎯 주요 사용법

### 1. 일일 분석 (Windows)
```cmd
cd .ai-workflow\scripts
gemini-daily.bat
```

Claude Code에서:
```
/gemini-daily
```

### 2. 기술 리서치
```cmd
gemini-research.bat "Redux vs Zustand 비교"
```

Claude Code에서:
```
/gemini-research
```

### 3. 코드 리뷰
```cmd
gemini-review.bat "최근변경사항"
```

Claude Code에서:
```
/gemini-review
```

## 역할 분담

### Gemini CLI
- ✅ 대규모 일괄 분석 (하루 1-2회)
- ✅ 비교 분석 및 리서치
- ✅ 코드 리뷰 (중요 PR만)
- ✅ 멀티모달 작업 (이미지/PDF → 코드)

### Claude Code
- ✅ 일반적인 코딩 작업
- ✅ 빠른 디버깅
- ✅ 테스트 작성
- ✅ 문서화
- ✅ 리팩토링
- ✅ 작은 기능 구현

## 플로우
1. Gemini CLI가 분석 수행
2. 결과를 `.ai-workflow/gemini-output/`에 저장
3. Claude Code가 슬래시 커맨드로 읽고 활용
