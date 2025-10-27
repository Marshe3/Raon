#!/bin/bash

# Gemini CLI 일일 분석 자동화 스크립트

set -e

# 설정
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/.ai-workflow/gemini-output/daily-analysis"
TEMPLATE="$PROJECT_ROOT/.ai-workflow/templates/daily-analysis.txt"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="$OUTPUT_DIR/analysis_$TIMESTAMP.md"

# 디렉토리 생성
mkdir -p "$OUTPUT_DIR"

echo "🔍 Gemini CLI 일일 분석 시작..."
echo "📁 프로젝트: $PROJECT_ROOT"
echo "📝 출력: $OUTPUT_FILE"

# 분석할 파일 목록 생성
echo "📋 분석 대상 파일 수집 중..."
FILES=""

# Backend Java 파일
if [ -d "$PROJECT_ROOT/board-back/src" ]; then
    BACKEND_FILES=$(find "$PROJECT_ROOT/board-back/src" -name "*.java" | head -n 100)
    FILES="$FILES $BACKEND_FILES"
fi

# Frontend TypeScript/React 파일
if [ -d "$PROJECT_ROOT/board-front/src" ]; then
    FRONTEND_FILES=$(find "$PROJECT_ROOT/board-front/src" \( -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" \) | head -n 100)
    FILES="$FILES $FRONTEND_FILES"
fi

# Gemini CLI 실행 (예시 - 실제 Gemini CLI 명령어로 교체 필요)
echo "🤖 Gemini CLI 분석 실행 중..."

# 템플릿 읽기
PROMPT=$(cat "$TEMPLATE")

# Gemini CLI 호출 (실제 명령어로 교체)
# 예시: gemini-cli analyze --files "$FILES" --prompt "$PROMPT" > "$OUTPUT_FILE"

# 임시로 파일 생성 (실제로는 Gemini CLI 결과가 저장됨)
cat > "$OUTPUT_FILE" << EOF
# 일일 분석 보고서
**생성 시간**: $(date)
**분석 대상**: Spring Boot + React 프로젝트

## 요약
- 전체 파일 수: [Gemini가 채울 내용]
- 주요 이슈 수: [Gemini가 채울 내용]
- 우선순위 높음: [Gemini가 채울 내용]
- 우선순위 중간: [Gemini가 채울 내용]
- 우선순위 낮음: [Gemini가 채울 내용]

## 상세 분석
[Gemini CLI 분석 결과가 여기에 저장됩니다]

## Claude Code 액션 아이템
- [ ] 항목1
- [ ] 항목2
- [ ] 항목3

## 수동 검토 필요
- [ ] 항목1
- [ ] 항목2

---
*이 보고서는 Gemini CLI에 의해 자동 생성되었습니다.*
EOF

echo "✅ 분석 완료!"
echo "📄 결과 파일: $OUTPUT_FILE"

# 최신 분석 결과로 심볼릭 링크 생성
ln -sf "$OUTPUT_FILE" "$OUTPUT_DIR/latest.md"

echo "🔗 최신 분석: $OUTPUT_DIR/latest.md"
echo ""
echo "💡 Claude Code에서 사용하려면: /gemini-daily"
