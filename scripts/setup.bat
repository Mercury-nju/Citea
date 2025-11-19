@echo off
echo 🚀 Setting up Citea - Free Citation Verification Tool
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

echo ✅ npm found
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
    echo 🎉 Setup complete!
    echo.
    echo To start the development server, run:
    echo   npm run dev
    echo.
    echo Then open http://localhost:3000 in your browser
    echo.
    echo Features available:
    echo   ✓ AI Source Finder
    echo   ✓ Citation Checker
    echo   ✓ AI Research Assistant
    echo.
    echo All features are 100%% FREE! 🎉
) else (
    echo.
    echo ❌ Installation failed. Please check the errors above.
    exit /b 1
)

