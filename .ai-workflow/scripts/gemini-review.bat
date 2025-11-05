@echo off
REM Gemini CLI 코드 리뷰 간소화 버전

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo ❌ 사용법: gemini-review.bat "대상"
    echo 예시: gemini-review.bat "최근변경사항"
    echo 예시: gemini-review.bat "PR-123"
    exit /b 1
)

set TARGET=%~1

REM 설정
set PROJECT_ROOT=%~dp0..\..
set OUTPUT_DIR=%PROJECT_ROOT%\.ai-workflow\gemini-output\code-review
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set OUTPUT_FILE=%OUTPUT_DIR%\review_%TARGET%_%TIMESTAMP%.md

REM 디렉토리 생성
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo 👀 Gemini CLI 코드 리뷰 시작...
echo 🎯 대상: %TARGET%
echo 📝 출력: %OUTPUT_FILE%

REM Gemini CLI로 코드 리뷰 수행
echo.
echo 🤖 Gemini CLI 실행 중... (리뷰에 2-3분 소요될 수 있습니다)
cd /d "%PROJECT_ROOT%"

REM 코드 리뷰 프롬프트
(
echo 현재 Spring Boot + React 프로젝트의 주요 파일들을 리뷰하고 다음 형식으로 보고서를 작성해주세요:
echo.
echo ## 전체 평가
echo - 승인 여부: [승인/조건부 승인/거부]
echo - 종합 점수: [1-10]
echo - 한줄 요약: [핵심 내용]
echo.
echo ## 주요 발견 사항
echo.
echo ### 긍정적인 점 ✅
echo [좋은 점 3-5개]
echo.
echo ### 개선 필요 사항 ⚠️
echo [파일:라인] - [이슈 설명] - [심각도: HIGH/MEDIUM/LOW]
echo.
echo ## 보안 체크
echo - SQL Injection: [OK/개선필요]
echo - XSS: [OK/개선필요]
echo - 인증/인가: [OK/개선필요]
echo.
echo ## 성능 체크
echo - N+1 쿼리: [OK/개선필요]
echo - 불필요한 API 호출: [OK/개선필요]
echo.
echo ## Claude Code 액션 아이템
echo - [ ] [파일:라인] - [구체적인 수정사항]
echo.
echo 주요 Java, TypeScript 파일을 중심으로 리뷰하되, 심각한 이슈에 집중해주세요.
) | gemini -m gemini-2.5-pro > "%OUTPUT_FILE%" 2>&1

if %errorlevel% equ 0 (
    echo ✅ 리뷰 완료!
) else (
    echo ⚠️ 리뷰 중 일부 문제가 발생했지만 결과를 저장했습니다.
)

REM 최신 리뷰 결과 복사
copy /Y "%OUTPUT_FILE%" "%OUTPUT_DIR%\latest.md" >nul

echo 📄 결과 파일: %OUTPUT_FILE%
echo 🔗 최신 리뷰: %OUTPUT_DIR%\latest.md
echo.
echo 💡 Claude Code에서 사용하려면: /gemini-review

endlocal
