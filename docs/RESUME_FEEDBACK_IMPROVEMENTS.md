# 자소서 AI 첨삭 성능 강화 및 LLM-as-a-Judge 구현

## 🎯 개선 목표

1. **더 구체적이고 실용적인 첨삭** 제공
2. **AI 첨삭 품질 검증** (LLM-as-a-Judge)
3. **평가 일관성 향상** (generationConfig 최적화)

---

## 📈 1. 프롬프트 성능 강화

### 기존 프롬프트 문제점
```
당신은 전문 취업 컨설턴트입니다.
다음 항목들을 평가하고 피드백을 제공해주세요:
1. 전반적인 인상 (5점 만점)
2. 구조와 논리성 (5점 만점)
...
```
- ❌ 역할이 모호함
- ❌ 평가 기준이 추상적
- ❌ 예시 없음
- ❌ 점수 스케일이 좁음 (1-5점)

### 개선된 프롬프트
```
당신은 삼성, 네이버, 카카오 등 대기업 인사팀에서 10년 이상 근무한
전문 채용 담당자입니다. 수천 개의 자기소개서를 검토한 경험을 바탕으로
엄격하고 객관적인 첨삭을 제공해주세요.

[우수 자소서 예시 - 90점대]
"대학교 2학년 때 진행한 '스마트 농장 관리 시스템' 프로젝트는
제 개발 인생의 전환점이었습니다. 농촌 지역의 인력 부족 문제를
해결하기 위해 IoT 센서와 AI 기반 작물 상태 분석 시스템을 개발했고,
실제 농장에 3개월간 시범 적용한 결과 인건비를 30%, 작물 수확량을
15% 향상시켰습니다..."

[보통 자소서 예시 - 50-60점대]
"저는 컴퓨터공학을 전공하며 개발에 관심을 가지게 되었습니다.
팀 프로젝트를 통해 협업의 중요성을 배웠고, 항상 최선을 다하는
자세로 임했습니다..."
```

### 개선 효과
✅ **구체적 역할 부여**: 대기업 인사팀 10년 경력
✅ **우수/보통 예시**: 명확한 기준 제시
✅ **상세 루브릭**: 각 점수별 구체적 기준
✅ **소수점 점수**: 1-5점 → 1.0-5.0점 (더 세밀한 평가)
✅ **개선점 추적**: `improvementPoints` 필드 추가

---

## ⚙️ 2. generationConfig 최적화

### Before (설정 없음)
```java
Map<String, Object> requestBody = Map.of(
    "contents", List.of(...)
);
```
→ 기본 설정 사용 (일관성 떨어짐)

### After
```java
Map<String, Object> requestBody = Map.of(
    "contents", List.of(...),
    "generationConfig", Map.of(
        "temperature", 0.3,        // 일관성과 정확성 향상
        "topP", 0.85,             // 상위 85% 토큰 사용
        "topK", 40,               // 상위 40개 토큰 중 선택
        "maxOutputTokens", 8192,  // 최대 응답 길이
        "candidateCount", 1       // 생성할 응답 수
    )
);
```

### 개선 효과
✅ **일관성 향상**: temperature 0.3으로 안정적 응답
✅ **품질 향상**: topP/topK로 고품질 토큰 선택
✅ **충분한 길이**: 8192 토큰 (약 6000자 한글)

---

## 🧑‍⚖️ 3. LLM-as-a-Judge 구현

### 개념
AI가 생성한 자소서를 **다른 AI가 평가**하여 품질을 검증

```
원본 자소서 → AI 첨삭 → 수정된 자소서
                ↓
         LLM-as-a-Judge
                ↓
        실제 개선되었는지 평가
```

### 사용 방법
```javascript
import { judgeRevision } from './services/geminiService';

const judgeResult = await judgeRevision(
  originalCoverLetter,  // 원본
  revisedCoverLetter    // AI가 수정한 버전
);

console.log(judgeResult);
```

### 응답 구조
```json
{
  "overallImprovement": 8,  // 전체 개선도 (1-10)
  "criteriaScores": {
    "specificity": 9,       // 구체성 향상
    "logic": 8,             // 논리성 강화
    "uniqueness": 7,        // 차별성 증대
    "readability": 9,       // 가독성 개선
    "firstImpression": 8    // 첫인상 강화
  },
  "improvements": [
    "추상적 표현 '열심히'가 구체적 수치 '3개월간 매일 2시간'으로 변경됨",
    "STAR 기법 적용으로 상황→행동→결과의 인과관계 명확해짐",
    "도입부 '저는 개발자가 되고 싶습니다'가 '스마트 농장 프로젝트는 제 전환점이었습니다'로 강렬하게 변경"
  ],
  "regressions": [
    "일부 전문 용어(CRDT)가 비전공자에게 어려울 수 있음"
  ],
  "recommendation": "강력 추천",
  "reasoning": "원본 대비 구체성이 크게 향상되었고, STAR 기법이 완벽히 적용되어 합격 가능성이 대폭 상승했습니다. 정량적 성과(30%, 15%)가 명확히 제시되어 신뢰도가 높습니다.",
  "verdict": "수정본은 우수 자소서 수준으로 개선되었습니다. 특히 프로젝트 성과의 구체성과 문제 해결 과정의 논리성이 뛰어납니다. 다만 CRDT 등 일부 전문 용어는 쉽게 풀어쓰는 것을 권장합니다."
}
```

### Judge 평가 기준

| 항목 | 평가 내용 | 점수 |
|------|-----------|------|
| **구체성 향상** | 추상적 표현 → 구체적 표현<br>수치, 고유명사, 기술명 추가 | 1-10 |
| **논리성 강화** | STAR 기법 적용<br>인과관계 명확화 | 1-10 |
| **차별성 증대** | 상투적 표현 제거<br>참신한 표현 사용 | 1-10 |
| **가독성 개선** | 문장 간결화<br>전문 용어 적절성 | 1-10 |
| **첫인상 강화** | 도입부 강렬함<br>흡입력 증가 | 1-10 |

### Judge 점수 해석

| 전체 개선도 | 의미 | 추천 |
|-------------|------|------|
| **9-10점** | 뛰어난 개선, 합격 가능성 대폭 상승 | 강력 추천 |
| **7-8점** | 명확한 개선, 실무에서 사용 가능 | 추천 |
| **4-6점** | 일부 개선되었으나 여전히 부족 | 조건부 추천 |
| **1-3점** | 거의 개선 없음 또는 오히려 악화 | 비추천 |

### Judge 특징
✅ **엄격한 평가**: temperature 0.2 (더 일관적)
✅ **과대평가 금지**: 실질적 개선만 인정
✅ **핵심 경험 보존**: 원본 경험 유실 시 감점
✅ **구체적 피드백**: 개선점/주의점 명시

---

## 🔄 4. 전체 흐름

### 기존 흐름
```
1. 자소서 작성
2. AI 첨삭 받기
3. 피드백 확인
4. 수정본 적용
5. 끝
```

### 개선된 흐름
```
1. 자소서 작성
2. AI 첨삭 받기 (성능 강화된 프롬프트)
   ↓
3. 피드백 + 수정본 받기
   - improvementPoints: 원본 대비 개선점
   - revisedCoverLetter: 새로 작성된 자소서
   ↓
4. [선택] LLM-as-a-Judge 평가
   - 원본 vs 수정본 비교
   - 실제 개선 여부 검증
   - 추천 여부 판단
   ↓
5. 수정본 적용 또는 재요청
```

---

## 📊 5. 성능 비교

| 항목 | 기존 | 개선 후 |
|------|------|---------|
| **프롬프트 역할** | 모호함 | 명확함 (대기업 인사팀 10년) |
| **예시** | 없음 | 우수/보통 예시 제공 |
| **평가 기준** | 추상적 | 상세 루브릭 |
| **점수 스케일** | 1-5점 | 1.0-5.0점 (소수점) |
| **일관성** | 낮음 | 높음 (temp 0.3) |
| **품질 검증** | 없음 | LLM-as-a-Judge |
| **개선점 추적** | 없음 | improvementPoints |

---

## 🎓 6. 사용 예시

### 일반 첨삭 (개선된 버전)
```javascript
import { getResumeFeedback } from './services/geminiService';

const feedback = await getResumeFeedback(coverLetter, {
  name: "홍길동",
  desiredPosition: "백엔드 개발자",
  skills: "Java, Spring Boot, MySQL",
  schoolName: "한국대학교",
  major: "컴퓨터공학",
  companyName: "네이버",
  position: "신입"
});

// 개선된 응답
console.log(feedback.overallScore);        // 3.8 (소수점)
console.log(feedback.improvementPoints);   // ["개선점1", "개선점2", ...]
console.log(feedback.revisedCoverLetter);  // AI가 새로 작성한 자소서
```

### Judge 평가
```javascript
import { judgeRevision } from './services/geminiService';

// AI 첨삭 후
const judgeResult = await judgeRevision(
  originalCoverLetter,
  feedback.revisedCoverLetter
);

// 판정 확인
if (judgeResult.overallImprovement >= 7) {
  console.log("수정본 사용 추천!");
  console.log(judgeResult.verdict);
} else {
  console.log("재첨삭 필요");
  console.log(judgeResult.regressions);
}
```

---

## 🔧 7. API 엔드포인트

### 기존 첨삭 (개선됨)
```
POST /raon/api/gemini/feedback

Request:
{
  "coverLetter": "자소서 내용",
  "name": "홍길동",
  "desiredPosition": "백엔드 개발자",
  ...
}

Response:
{
  "overallScore": 3.8,
  "sections": [...],
  "summary": "...",
  "revisedCoverLetter": "...",
  "improvementPoints": ["개선점1", "개선점2", ...]
}
```

### Judge 평가 (신규)
```
POST /raon/api/gemini/judge

Request:
{
  "originalCoverLetter": "원본",
  "revisedCoverLetter": "수정본"
}

Response:
{
  "overallImprovement": 8,
  "criteriaScores": {...},
  "improvements": [...],
  "regressions": [...],
  "recommendation": "강력 추천",
  "reasoning": "...",
  "verdict": "..."
}
```

---

## ✅ 커밋 정보

- **커밋 해시**: `79bccd0`
- **브랜치**: main
- **변경 파일**:
  - `GeminiController.java`: 프롬프트 개선 + Judge 엔드포인트
  - `CoverLetterJudgeRequest.java`: Judge DTO (신규)
  - `geminiService.js`: judgeRevision() 함수 추가
  - `AI_FEEDBACK_COMPARISON.md`: 비교 문서 (신규)
