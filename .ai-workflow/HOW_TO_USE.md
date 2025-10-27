# 🎯 실제 사용 방법 - 단계별 가이드

## 📋 사용자 시나리오별 실행 방법

---

## 시나리오 1️⃣: 매일 아침 코드 품질 체크

### 상황
출근해서 어제 작성한 코드에 문제가 없는지, 개선할 점은 없는지 확인하고 싶다.

### 실행 방법

**Step 1: Gemini CLI로 분석 실행**

Windows 탐색기에서:
```
📁 C:\Users\USER\Desktop\Spring-React-MySQL\.ai-workflow\scripts
```
폴더로 이동 → `gemini-daily.bat` 더블클릭

또는 명령 프롬프트(CMD)에서:
```cmd
cd C:\Users\USER\Desktop\Spring-React-MySQL\.ai-workflow\scripts
gemini-daily.bat
```

**실행 화면:**
```
🔍 Gemini CLI 일일 분석 시작...
📁 프로젝트: C:\Users\USER\Desktop\Spring-React-MySQL
📝 출력: ...analysis_20251017_090000.md

🤖 Gemini CLI 실행 중... (분석에 2-3분 소요될 수 있습니다)

✅ 분석 완료!
📄 결과 파일: ...
🔗 최신 분석: .ai-workflow\gemini-output\daily-analysis\latest.md

💡 Claude Code에서 사용하려면: /gemini-daily
```

**Step 2: Claude Code에서 결과 확인**

VSCode에서 Claude Code를 열고:
```
/gemini-daily
```
입력 후 Enter

**Claude의 응답 예시:**
```
📊 일일 분석 결과를 확인했습니다.

## 요약
- Backend: Spring Boot 3.4.10
- Frontend: React 19.2.0
- 전체 파일 수: 79개
- 주요 이슈: 5개

## 자동 처리 가능 항목 ✅
1. ✅ board-front/package.json - axios 라이브러리 추가
2. ✅ board-front/src/apis/index.ts - API 클라이언트 기본 구조 생성
3. ✅ board-back/src/.../Controller.java - 에러 핸들링 개선

처리를 시작할까요? (Y/n)
```

**Step 3: 자동 수정 승인**
```
Y
```
입력하면 Claude가 자동으로 수정 시작!

---

## 시나리오 2️⃣: 기술 선택이 필요할 때

### 상황
"프론트엔드 상태 관리 라이브러리를 뭘 쓸지 모르겠어. Redux? Zustand? Jotai?"

### 실행 방법

**Step 1: Gemini CLI로 리서치 실행**

명령 프롬프트(CMD)에서:
```cmd
cd C:\Users\USER\Desktop\Spring-React-MySQL\.ai-workflow\scripts
gemini-research.bat "React 상태관리: Redux vs Zustand vs Jotai"
```

**실행 화면:**
```
🔬 Gemini CLI 리서치 시작...
📋 주제: React 상태관리: Redux vs Zustand vs Jotai
📝 출력: ...

🤖 Gemini CLI 실행 중... (리서치에 2-3분 소요될 수 있습니다)

✅ 리서치 완료!
📄 결과 파일: ...
🔗 최신 리서치: .ai-workflow\gemini-output\research\latest.md

💡 Claude Code에서 사용하려면: /gemini-research
```

**Step 2: Claude Code에서 결과 확인**

VSCode의 Claude Code에서:
```
/gemini-research
```

**Claude의 응답 예시:**
```
📚 리서치 결과를 확인했습니다.

## 요약
**추천 옵션:** Zustand (1순위)

## 근거
- Redux: 너무 복잡함 (Boilerplate 많음)
- Zustand: 간단하고 성능 좋음 ✅
- Jotai: 좋지만 생태계가 작음

## 현재 프로젝트 적용 방안
1. zustand 설치 (2분)
2. store 생성 (5분)
3. 기존 코드 마이그레이션 (15분)

Zustand를 설치하고 기본 설정을 진행할까요? (Y/n)
```

**Step 3: 구현 승인**
```
Y
```
Claude가 자동으로 Zustand 설치 및 설정 완료!

---

## 시나리오 3️⃣: PR 전 코드 리뷰

### 상황
"PR 올리기 전에 문제가 없는지 체크하고 싶어"

### 실행 방법

**Step 1: Gemini CLI로 코드 리뷰 실행**

명령 프롬프트(CMD)에서:
```cmd
cd C:\Users\USER\Desktop\Spring-React-MySQL\.ai-workflow\scripts
gemini-review.bat "최근변경사항"
```

**실행 화면:**
```
👀 Gemini CLI 코드 리뷰 시작...
🎯 대상: 최근변경사항
📝 출력: ...

🤖 Gemini CLI 실행 중... (리뷰에 2-3분 소요될 수 있습니다)

✅ 리뷰 완료!
📄 결과 파일: ...
🔗 최신 리뷰: .ai-workflow\gemini-output\code-review\latest.md

💡 Claude Code에서 사용하려면: /gemini-review
```

**Step 2: Claude Code에서 결과 확인**

VSCode의 Claude Code에서:
```
/gemini-review
```

**Claude의 응답 예시:**
```
👀 코드 리뷰 결과를 확인했습니다.

## 전체 평가
- 승인 여부: 조건부 승인 ⚠️
- 종합 점수: 7/10
- 한줄 요약: 기능은 정상이지만 보안 및 에러 처리 개선 필요

## 긍정적인 점 ✅
1. 코드 구조가 깔끔함
2. 네이밍이 명확함

## 개선 필요 사항 ⚠️
1. [HIGH] board-back/.../UserService.java:45 - SQL Injection 취약점
2. [MEDIUM] board-front/.../Login.tsx:78 - 에러 핸들링 부재

## 즉시 수정 가능 항목
- [ ] UserService.java:45 - Prepared Statement 사용
- [ ] Login.tsx:78 - try-catch 추가

이 항목들을 자동으로 수정할까요? (Y/n)
```

**Step 3: 자동 수정**
```
Y
```
Claude가 지적사항 자동 수정!

---

## 🔄 일반적인 워크플로우

### 매일 아침 루틴 (추천)

```
09:00 ─┬─> 1. gemini-daily.bat 실행
       │    (컴퓨터 켜자마자 더블클릭)
       │
09:03 ─┼─> 2. 분석 완료 대기
       │    (커피 한 잔 ☕)
       │
09:05 ─┼─> 3. VSCode 열기
       │
09:06 ─┼─> 4. Claude Code에서 /gemini-daily
       │
09:07 ─┼─> 5. 자동 수정 승인
       │
09:10 ─┴─> 완료! 깨끗한 코드로 하루 시작 ✨
```

---

## 📁 파일 구조 이해하기

### Gemini 분석 결과가 저장되는 곳
```
.ai-workflow/
└── gemini-output/
    ├── daily-analysis/
    │   ├── latest.md              ← Claude가 읽는 파일
    │   ├── analysis_20251017_090000.md
    │   └── analysis_20251017_180000.md
    │
    ├── research/
    │   ├── latest.md              ← Claude가 읽는 파일
    │   └── React_상태관리_20251017.md
    │
    └── code-review/
        ├── latest.md              ← Claude가 읽는 파일
        └── review_최근변경사항_20251017.md
```

### 직접 파일 열어서 확인하기
VSCode에서:
```
📁 .ai-workflow/gemini-output/daily-analysis/latest.md
```
파일을 열면 Gemini의 분석 결과를 직접 볼 수 있습니다.

---

## 🎮 간단 명령어 치트시트

### Windows 탐색기에서 (마우스)
```
1. 📁 .ai-workflow\scripts 폴더 열기
2. gemini-daily.bat 더블클릭
3. VSCode 열기
4. Claude Code에서 "/gemini-daily" 입력
```

### CMD에서 (키보드)
```cmd
# 일일 분석
cd .ai-workflow\scripts && gemini-daily.bat

# 리서치
cd .ai-workflow\scripts && gemini-research.bat "주제"

# 코드 리뷰
cd .ai-workflow\scripts && gemini-review.bat "대상"
```

### VSCode에서
```
/gemini-daily      # 일일 분석 결과 보기
/gemini-research   # 리서치 결과 보기
/gemini-review     # 코드 리뷰 결과 보기
```

---

## 💡 Pro Tips

### Tip 1: 자동화 설정
Windows 작업 스케줄러로 매일 아침 자동 실행:
1. Windows 검색 → "작업 스케줄러"
2. "기본 작업 만들기"
3. 이름: "Gemini Daily Analysis"
4. 트리거: 매일 오전 9시
5. 동작: `C:\Users\USER\Desktop\Spring-React-MySQL\.ai-workflow\scripts\gemini-daily.bat`

→ 이제 출근하면 이미 분석 완료! ✨

### Tip 2: 결과 파일 직접 확인
Claude 없이도 분석 결과를 볼 수 있습니다:
```
.ai-workflow\gemini-output\daily-analysis\latest.md
```
파일을 메모장이나 VSCode로 열면 됩니다.

### Tip 3: 빠른 실행 단축키 만들기
바탕화면에 바로가기 생성:
1. `gemini-daily.bat` 우클릭
2. "바로가기 만들기"
3. 바탕화면으로 이동
→ 더블클릭 한 번으로 실행!

---

## ❓ 자주 묻는 질문

### Q1: 분석에 얼마나 걸리나요?
**A:** 2-3분 정도 소요됩니다. 커피 한 잔 마시는 시간! ☕

### Q2: 비용은 얼마나 드나요?
**A:** Gemini CLI는 하루 1-2회만 실행하므로 비용이 적습니다.
- Gemini: 대규모 분석 (비용 높지만 횟수 적음)
- Claude: 실시간 코딩 (빠르고 자주 사용)

### Q3: 인터넷 연결이 필요한가요?
**A:** 네, Gemini CLI와 Claude Code 모두 API 호출이 필요합니다.

### Q4: 분석 결과를 팀과 공유할 수 있나요?
**A:** 네! `.ai-workflow/gemini-output/` 폴더의 마크다운 파일을 공유하면 됩니다.

### Q5: Claude가 수정한 내용이 마음에 안 들어요
**A:** Git으로 되돌리거나, Claude에게 다시 요청하면 됩니다.

---

## 🚀 시작하기

**지금 바로 실행해보세요:**

1️⃣ CMD 열기 (Windows + R → cmd → Enter)

2️⃣ 명령 실행:
```cmd
cd C:\Users\USER\Desktop\Spring-React-MySQL\.ai-workflow\scripts
gemini-daily.bat
```

3️⃣ VSCode 열고 Claude Code에서:
```
/gemini-daily
```

**그게 전부입니다!** 🎉

---

**문제가 있나요?**
- [QUICKSTART.md](QUICKSTART.md) - 빠른 시작 가이드
- [USAGE.md](USAGE.md) - 상세 사용 방법
