@echo off
REM Gemini CLI 일일 분석 간소화 버전

setlocal enabledelayedexpansion

REM 설정
set PROJECT_ROOT=%~dp0..\..
set OUTPUT_DIR=%PROJECT_ROOT%\.ai-workflow\gemini-output\daily-analysis
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set OUTPUT_FILE=%OUTPUT_DIR%\analysis_%TIMESTAMP%.md

REM 디렉토리 생성
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo 🔍 Gemini CLI 일일 분석 시작...
echo 📁 프로젝트: %PROJECT_ROOT%
echo 📝 출력: %OUTPUT_FILE%

REM Gemini CLI로 프로젝트 분석 수행
echo.
echo 🤖 Gemini CLI 실행 중... (분석에 2-3분 소요될 수 있습니다)
cd /d "%PROJECT_ROOT%"

REM 간단한 프롬프트로 Gemini 실행 (타임아웃 방지)
(
echo 현재 디렉토리의 Spring Boot + React 프로젝트를 간단히 분석해주세요.
echo.
echo 다음 형식으로 작성:
echo.
echo ## 요약
echo - Backend: [Spring Boot 버전 및 주요 의존성]
echo - Frontend: [React 버전 및 주요 라이브러리]
echo - 전체 파일 수: [개수]
echo.
echo ## 주요 발견 사항
echo [3-5개의 주요 이슈 또는 개선점]
echo.
echo ## Claude Code 액션 아이템
echo - [ ] [파일경로:라인] - [구체적인 수정사항]
echo.
echo board-back과 board-front 디렉토리를 중심으로 분석하되, 파일 읽기는 최소화하고 구조 파악에 집중해주세요.
) | gemini -m gemini-2.5-pro > "%OUTPUT_FILE%" 2>&1

if %errorlevel% equ 0 (
    echo ✅ 분석 완료!
) else (
    echo ⚠️ 분석 중 일부 문제가 발생했지만 결과를 저장했습니다.
)

REM 최신 분석 결과 복사
copy /Y "%OUTPUT_FILE%" "%OUTPUT_DIR%\latest.md" >nul

echo 📄 결과 파일: %OUTPUT_FILE%
echo 🔗 최신 분석: %OUTPUT_DIR%\latest.md
echo.
echo 💡 Claude Code에서 사용하려면: /gemini-daily

endlocal
