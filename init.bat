@echo off
echo 🚀 MultiAgent Claude Quick Initializer
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org
    exit /b 1
)

where claude >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Claude CLI not found. Installing...
    npm install -g @anthropic-ai/claude-cli
)

echo Select initialization type:
echo 1) Standard multi-agent setup
echo 2) Memory-focused setup
echo 3) Setup with documentation import
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    node cli\index.js init
) else if "%choice%"=="2" (
    node cli\index.js init --memory-only
) else if "%choice%"=="3" (
    node cli\index.js init --with-docs
) else (
    echo Invalid choice. Running standard setup...
    node cli\index.js init
)