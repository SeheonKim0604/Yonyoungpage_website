@echo off
chcp 65001 >nul
echo ========================================
echo 연영회 홈페이지 실행 중...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Node.js 버전 확인 중...
node --version
if errorlevel 1 (
    echo.
    echo 오류: Node.js가 설치되어 있지 않거나 PATH에 등록되지 않았습니다.
    echo Node.js를 설치하고 컴퓨터를 재시작해주세요.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] 패키지 설치 중... (처음 실행 시에만 필요합니다)
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo.
        echo 오류: 패키지 설치에 실패했습니다.
        pause
        exit /b 1
    )
) else (
    echo node_modules 폴더가 이미 존재합니다. 건너뜁니다.
)

echo.
echo [3/3] 개발 서버 시작 중...
echo.
echo ========================================
echo 서버가 시작되면 브라우저에서 다음 주소로 접속하세요:
echo http://localhost:3000
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

call npm run dev

pause
