# 🔄 다른 프로젝트에 설치하기

## 개요

현재 구축한 Gemini CLI + Claude Code 자동화 워크플로우를 **다른 프로젝트에도 쉽게 적용**할 수 있습니다!

---

## ✅ 간단 요약

**네, 복사-붙여넣기만 하면 됩니다!**

```
1. .ai-workflow 폴더 복사
2. .claude 폴더 복사
3. 새 프로젝트에 붙여넣기
4. 끝! (경로는 자동으로 맞춰집니다)
```

---

## 📋 상세 설치 가이드

### 방법 1: 폴더 복사 (가장 간단)

#### Step 1: 현재 프로젝트에서 복사
```
📁 C:\Users\USER\Desktop\Spring-React-MySQL\

복사할 폴더:
├── .ai-workflow        ← 이 폴더 전체 복사
└── .claude            ← 이 폴더 전체 복사
```

Windows 탐색기에서:
1. `.ai-workflow` 폴더 우클릭 → 복사
2. `.claude` 폴더 우클릭 → 복사

#### Step 2: 새 프로젝트에 붙여넣기
```
📁 C:\Users\USER\Desktop\NewProject\

붙여넣기:
├── .ai-workflow        ← 여기에 붙여넣기
└── .claude            ← 여기에 붙여넣기
```

새 프로젝트 폴더에서:
1. 우클릭 → 붙여넣기

#### Step 3: 완료!
```
📁 C:\Users\USER\Desktop\NewProject\
├── .ai-workflow/
│   ├── scripts/
│   │   ├── gemini-daily.bat      ✅ 바로 사용 가능
│   │   ├── gemini-research.bat   ✅ 바로 사용 가능
│   │   └── gemini-review.bat     ✅ 바로 사용 가능
│   ├── templates/                ✅ 바로 사용 가능
│   ├── gemini-output/            (자동 생성됨)
│   └── *.md                      ✅ 문서들
├── .claude/
│   └── commands/
│       ├── gemini-daily.md       ✅ 바로 사용 가능
│       ├── gemini-research.md    ✅ 바로 사용 가능
│       └── gemini-review.md      ✅ 바로 사용 가능
└── (새 프로젝트 파일들)
```

**바로 사용 가능합니다!** 경로는 스크립트가 자동으로 계산합니다.

---

## 🎯 바로 테스트하기

새 프로젝트에서:

```cmd
cd NewProject\.ai-workflow\scripts
gemini-daily.bat
```

그 다음 Claude Code에서:
```
/gemini-daily
```

**완벽하게 작동합니다!** ✅

---

## 🔧 스크립트가 자동으로 경로를 찾는 원리

### gemini-daily.bat 내부:
```batch
set PROJECT_ROOT=%~dp0..\..
```

이 명령어가 현재 스크립트 위치에서 자동으로 프로젝트 루트를 계산합니다:

```
실행 위치:    NewProject\.ai-workflow\scripts\gemini-daily.bat
              ↓ (%~dp0)
스크립트 폴더: NewProject\.ai-workflow\scripts\
              ↓ (\..)
상위 폴더:    NewProject\.ai-workflow\
              ↓ (\..)
프로젝트 루트: NewProject\                    ← 자동 계산!
```

**따라서 어떤 프로젝트에 복사해도 자동으로 경로가 맞춰집니다!** 🎉

---

## 📝 프로젝트별 커스터마이징 (선택사항)

### 1. 프로젝트 타입에 맞게 템플릿 수정

새 프로젝트가 다른 기술 스택이라면:

**`.ai-workflow/templates/daily-analysis.txt` 수정:**

```
원본 (Spring Boot + React):
- Backend: Spring Boot (Java)
- Frontend: React + TypeScript
- Database: MySQL

새 프로젝트 (Node.js + Vue):
- Backend: Node.js + Express
- Frontend: Vue.js + TypeScript
- Database: PostgreSQL
```

### 2. 분석 항목 추가/제거

프로젝트 특성에 맞게 분석 항목 조정:

**예시: ML 프로젝트의 경우**
```
추가 분석 항목:
- 모델 성능 분석
- 데이터 파이프라인 검토
- 학습 효율성 체크
```

### 3. 프로젝트명 변경 (선택사항)

문서 파일들의 프로젝트 이름만 찾아서 바꾸면 됩니다:
- `.ai-workflow/QUICKSTART.md`
- `.ai-workflow/USAGE.md`
- 기타 문서들

**하지만 필수는 아닙니다!** 스크립트는 그대로 작동합니다.

---

## 🚀 실전 예시

### 예시 1: Vue.js 프로젝트

```
📁 C:\Projects\vue-ecommerce\

1. .ai-workflow 복사-붙여넣기
2. .claude 복사-붙여넣기
3. gemini-daily.bat 실행
```

**결과:**
```
✅ Vue.js 프로젝트 분석 완료!
- Frontend: Vue.js 3.4
- 컴포넌트 구조 분석
- Vuex 상태 관리 검토
```

### 예시 2: Python Django 프로젝트

```
📁 C:\Projects\django-blog\

1. .ai-workflow 복사-붙여넣기
2. .claude 복사-붙여넣기
3. templates/daily-analysis.txt 수정 (선택)
   - "Spring Boot" → "Django"
   - "React" → "Django Templates"
4. gemini-daily.bat 실행
```

**결과:**
```
✅ Django 프로젝트 분석 완료!
- Backend: Django 4.2
- ORM 쿼리 최적화 제안
- 보안 설정 검토
```

### 예시 3: Next.js 풀스택 프로젝트

```
📁 C:\Projects\nextjs-saas\

1. .ai-workflow 복사-붙여넣기
2. .claude 복사-붙여넣기
3. 바로 실행!
```

**결과:**
```
✅ Next.js 프로젝트 분석 완료!
- Framework: Next.js 14
- API Routes 검토
- SSR/SSG 최적화 제안
```

---

## 💡 여러 프로젝트 동시 관리

### 시나리오: 3개 프로젝트 동시 진행

```
📁 C:\Projects\
├── spring-react-mysql\
│   ├── .ai-workflow\          ✅ 설치됨
│   └── .claude\               ✅ 설치됨
│
├── vue-ecommerce\
│   ├── .ai-workflow\          ✅ 복사함
│   └── .claude\               ✅ 복사함
│
└── django-blog\
    ├── .ai-workflow\          ✅ 복사함
    └── .claude\               ✅ 복사함
```

### 각 프로젝트 독립적으로 작동:

**프로젝트 A (아침):**
```cmd
cd C:\Projects\spring-react-mysql\.ai-workflow\scripts
gemini-daily.bat
```

**프로젝트 B (점심):**
```cmd
cd C:\Projects\vue-ecommerce\.ai-workflow\scripts
gemini-daily.bat
```

**프로젝트 C (저녁):**
```cmd
cd C:\Projects\django-blog\.ai-workflow\scripts
gemini-daily.bat
```

**분석 결과도 각각 독립적으로 저장됩니다!**

---

## 📊 파일 분리 현황

각 프로젝트는 자신의 분석 결과만 가집니다:

```
프로젝트 A:
.ai-workflow/gemini-output/daily-analysis/latest.md
→ Spring Boot + React 분석 결과

프로젝트 B:
.ai-workflow/gemini-output/daily-analysis/latest.md
→ Vue.js 분석 결과

프로젝트 C:
.ai-workflow/gemini-output/daily-analysis/latest.md
→ Django 분석 결과
```

**서로 섞이지 않습니다!** ✅

---

## 🎁 보너스: 재사용 템플릿 만들기

자주 새 프로젝트를 시작한다면:

### 1. 템플릿 폴더 만들기
```
📁 C:\Templates\ai-workflow-template\
├── .ai-workflow\
└── .claude\
```

### 2. 필요할 때마다 복사
```
새 프로젝트 시작 시:
1. ai-workflow-template 폴더 열기
2. .ai-workflow + .claude 복사
3. 새 프로젝트에 붙여넣기
4. 끝!
```

### 3. 버전 관리 (선택사항)
```
Git으로 템플릿 관리:
git init
git add .ai-workflow .claude
git commit -m "AI workflow template"
```

---

## ❓ FAQ

### Q1: 경로 수정이 필요한가요?
**A:** 아니요! 스크립트가 자동으로 경로를 계산합니다.

### Q2: 여러 프로젝트에서 동시 실행 가능한가요?
**A:** 네! 각 프로젝트는 독립적으로 작동합니다.

### Q3: 프로젝트 타입이 달라도 되나요?
**A:** 네! 템플릿만 수정하면 어떤 언어/프레임워크든 가능합니다.

### Q4: Git에 포함해도 되나요?
**A:** 네! `.ai-workflow`와 `.claude`를 Git에 커밋하면 팀원들도 사용할 수 있습니다.
   - 단, `gemini-output/` 폴더는 `.gitignore`에 추가 권장

### Q5: 팀원과 공유하려면?
**A:** Git에 푸시하거나, 폴더를 압축해서 공유하면 됩니다.

---

## 🎯 체크리스트

새 프로젝트에 설치할 때:

- [ ] `.ai-workflow` 폴더 복사
- [ ] `.claude` 폴더 복사
- [ ] 새 프로젝트에 붙여넣기
- [ ] `gemini-daily.bat` 테스트 실행
- [ ] Claude Code에서 `/gemini-daily` 테스트
- [ ] (선택) 템플릿 파일 수정
- [ ] (선택) 문서의 프로젝트명 변경

---

## 🎉 완료!

**이제 모든 프로젝트에서 Gemini + Claude 자동화를 사용할 수 있습니다!**

### 요약:
1. ✅ 복사-붙여넣기만 하면 됩니다
2. ✅ 경로는 자동으로 맞춰집니다
3. ✅ 여러 프로젝트에서 독립적으로 작동
4. ✅ 프로젝트 타입 무관하게 사용 가능

**Happy Coding in All Projects!** 🚀
