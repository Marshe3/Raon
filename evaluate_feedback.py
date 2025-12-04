#!/usr/bin/env python3
"""
피드백 품질 자동 평가 스크립트 (Python)
실행: python evaluate_feedback.py
"""

import requests
import json
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

# 테스트 샘플
TEST_SAMPLES = [
    {
        "name": "추상적 답변",
        "conversation": """
[면접관] 팀 프로젝트에서 갈등을 해결한 경험이 있나요?
[면접자] 네, 있습니다. 팀원들과 의견이 달라서 갈등이 있었는데
대화를 통해 잘 해결했습니다. 그래서 프로젝트를 성공적으로 마칠 수 있었습니다.
        """
    },
    {
        "name": "구체적 답변",
        "conversation": """
[면접관] 팀 프로젝트에서 갈등을 해결한 경험이 있나요?
[면접자] 네, 지난 학기 웹 개발 프로젝트에서 5명의 팀원 중 2명이
프론트엔드 프레임워크 선택으로 의견이 나뉘었습니다.
저는 React를 선호했고 다른 팀원은 Vue를 원했습니다.
2일간 각각 프로토타입을 만들어 성능과 학습곡선을 비교했고,
최종적으로 팀원 전체가 익숙한 React를 선택했습니다.
결과적으로 3주 만에 프로젝트를 완성하고 A학점을 받았습니다.
        """
    }
]

def call_gemini(prompt):
    """Gemini API 호출"""
    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.8,
            "topK": 40,
            "maxOutputTokens": 2048
        }
    }

    response = requests.post(
        f"{GEMINI_URL}?key={GEMINI_API_KEY}",
        headers=headers,
        json=body
    )

    if response.status_code == 200:
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        # JSON 추출
        text = text.replace("```json", "").replace("```", "").strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            return text[start:end]
    return "{}"

def generate_feedback_old(conversation):
    """개선 전 프롬프트"""
    prompt = f"""
당신은 면접관입니다. 다음 면접을 평가해주세요.

[면접 대화]
{conversation}

다음 항목을 각각 100점 만점으로 평가하고 피드백을 제공해주세요:
1. 적합성
2. 구체성
3. 논리성

JSON 형식으로만 답변해주세요.
    """
    return call_gemini(prompt)

def generate_feedback_new(conversation):
    """개선 후 프롬프트 (Few-shot + 루브릭)"""
    prompt = f"""
당신은 삼성, LG, 네이버, 카카오 등 대기업 면접을 10년 이상 진행한 전문 면접관입니다.

[우수 답변 예시 - 95점]
질문: "팀 프로젝트에서 갈등을 해결한 경험이 있나요?"
답변: "백엔드 개발 중 API 설계 방식으로 팀원과 의견 충돌이 있었습니다. 저는 RESTful 방식을 주장했고 동료는 GraphQL을 선호했습니다. 양측 장단점을 문서화하고, 프로토타입을 각각 2일간 개발해 성능 테스트를 진행했습니다. 결과적으로 우리 서비스의 단순한 CRUD 특성상 RESTful이 더 적합하다는 데이터를 제시하여 합의했고, 이후 GraphQL의 장점은 차기 프로젝트에 반영하기로 했습니다."

평가: 적합성 95점, 구체성 98점, 논리성 92점
이유: 구체적 상황, 정량적 근거(2일간), 해결 과정, 후속 조치까지 완벽

[보통 답변 예시 - 55점]
답변: "네, 팀 프로젝트에서 의견이 달라서 서로 토론을 통해 해결했습니다."
평가: 적합성 60점, 구체성 30점, 논리성 50점
이유: 추상적이고 구체성 부족

**구체성 평가 기준**
- 90-100점: 수치 5개 이상 + 상세 과정
- 70-89점: 수치 3-4개
- 50-69점: 수치 1-2개
- 0-29점: 완전히 추상적

[면접 대화]
{conversation}

위 예시와 기준을 참고하여 엄격하게 평가하고 구체적 피드백을 제공해주세요.
JSON 형식으로만 답변해주세요.
    """
    return call_gemini(prompt)

def evaluate_feedback_quality(original, feedback):
    """피드백 품질 평가"""
    prompt = f"""
당신은 피드백 품질 평가 전문가입니다.

[원본 면접]
{original}

[제공된 피드백]
{feedback}

다음 기준으로 피드백을 평가하세요 (0-100점):
1. 구체성: 막연하지 않고 구체적인가?
2. 실행가능성: 적용 가능한 조언인가?
3. 정확성: 평가가 정확한가?

JSON 형식:
{{
  "specificity": 점수,
  "actionability": 점수,
  "accuracy": 점수,
  "overallScore": 평균,
  "reasoning": "평가 이유"
}}
    """
    return call_gemini(prompt)

def main():
    print("=" * 80)
    print("피드백 품질 자동 평가")
    print("=" * 80)

    total_improvement = 0

    for i, sample in enumerate(TEST_SAMPLES, 1):
        print(f"\n[테스트 {i}: {sample['name']}]")
        print(sample['conversation'].strip())

        # 피드백 생성
        print("\n⏳ 피드백 생성 중...")
        feedback_old = generate_feedback_old(sample['conversation'])
        feedback_new = generate_feedback_new(sample['conversation'])

        # 품질 평가
        print("⏳ 품질 평가 중...")
        score_old = json.loads(evaluate_feedback_quality(sample['conversation'], feedback_old))
        score_new = json.loads(evaluate_feedback_quality(sample['conversation'], feedback_new))

        # 결과 출력
        print("\n┌─ 개선 전 ─┐")
        print(f"구체성:      {score_old.get('specificity', 0):.1f}점")
        print(f"실행가능성:  {score_old.get('actionability', 0):.1f}점")
        print(f"정확성:      {score_old.get('accuracy', 0):.1f}점")
        print(f"종합:        {score_old.get('overallScore', 0):.1f}점")

        print("\n┌─ 개선 후 ─┐")
        print(f"구체성:      {score_new.get('specificity', 0):.1f}점")
        print(f"실행가능성:  {score_new.get('actionability', 0):.1f}점")
        print(f"정확성:      {score_new.get('accuracy', 0):.1f}점")
        print(f"종합:        {score_new.get('overallScore', 0):.1f}점")

        improvement = score_new.get('overallScore', 0) - score_old.get('overallScore', 0)
        improvement_percent = (improvement / score_old.get('overallScore', 1)) * 100

        print(f"\n✅ 개선율: {improvement:.1f}점 ({improvement_percent:.1f}%)")
        print(f"평가 이유: {score_new.get('reasoning', 'N/A')}")
        print("-" * 80)

        total_improvement += improvement_percent

    print(f"\n{'=' * 80}")
    print(f"평균 개선율: {total_improvement / len(TEST_SAMPLES):.1f}%")
    print(f"{'=' * 80}")

if __name__ == "__main__":
    main()
