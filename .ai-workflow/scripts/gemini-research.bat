@echo off
REM Gemini CLI 리서치 간소화 버전

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo ❌ 사용법: gemini-research.bat "리서치 주제"
    echo 예시: gemini-research.bat "Spring Security vs JWT vs OAuth2"
    exit /b 1
)

set RESEARCH_TOPIC=%~1

REM 설정
set PROJECT_ROOT=%~dp0..\..
set OUTPUT_DIR=%PROJECT_ROOT%\.ai-workflow\gemini-output\research
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set SAFE_TOPIC=%RESEARCH_TOPIC: =_%
set OUTPUT_FILE=%OUTPUT_DIR%\%SAFE_TOPIC%_%TIMESTAMP%.md

REM 디렉토리 생성
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo 🔬 Gemini CLI 리서치 시작...
echo 📋 주제: %RESEARCH_TOPIC%
echo 📝 출력: %OUTPUT_FILE%

REM Gemini CLI로 리서치 수행
echo.
echo 🤖 Gemini CLI 실행 중... (리서치에 2-3분 소요될 수 있습니다)
cd /d "%PROJECT_ROOT%"

REM 리서치 프롬프트
(
echo "%RESEARCH_TOPIC%" 주제에 대해 기술 리서치를 수행하고 다음 형식으로 보고서를 작성해주세요:
echo.
echo ## 요약
echo - 추천 옵션: [1순위, 2순위, 3순위]
echo - 핵심 근거: [3-5줄 요약]
echo.
echo ## 상세 비교
echo ^| 항목 ^| 옵션1 ^| 옵션2 ^| 옵션3 ^|
echo ^|---^|---^|---^|---^|
echo ^| 장점 ^| ... ^| ... ^| ... ^|
echo ^| 단점 ^| ... ^| ... ^| ... ^|
echo.
echo ## Spring Boot + React 프로젝트 적용 방안
echo 1. 적용 단계
echo 2. 예상 소요 시간
echo 3. 리스크 요인
echo.
echo ## Claude Code 구현 가이드
echo [단계별 구현 지침과 코드 예시]
) | gemini -m gemini-2.5-pro > "%OUTPUT_FILE%" 2>&1

if %errorlevel% equ 0 (
    echo ✅ 리서치 완료!
) else (
    echo ⚠️ 리서치 중 일부 문제가 발생했지만 결과를 저장했습니다.
)

REM 최신 리서치 결과 복사
copy /Y "%OUTPUT_FILE%" "%OUTPUT_DIR%\latest.md" >nul

echo 📄 결과 파일: %OUTPUT_FILE%
echo 🔗 최신 리서치: %OUTPUT_DIR%\latest.md
echo.
echo 💡 Claude Code에서 사용하려면: /gemini-research

endlocal
