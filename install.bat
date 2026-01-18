@echo off
chcp 65001 >nul
echo ========================================
echo 연영회 홈페이지 - 패키지 설치
echo ========================================
echo.

cd /d "%~dp0"

echo Node.js 버전 확인 중...
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
echo npm 버전 확인 중...
call npm --version
if errorlevel 1 (
    echo.
    echo 오류: npm이 실행되지 않습니다.
    echo Node.js를 재설치해주세요.
    echo.
    pause
    exit /b 1
)

echo.
echo 패키지 설치 중... (몇 분 걸릴 수 있습니다)
echo.
call npm install

if errorlevel 1 (
    echo.
    echo 오류: 패키지 설치에 실패했습니다.
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo 패키지 설치가 완료되었습니다!
    echo 이제 start.bat 파일을 실행하세요.
    echo ========================================
    echo.
)

pause
