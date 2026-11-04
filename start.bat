@echo off
echo Starting LeadFinder...
echo.
echo [1/2] Starting Backend Server (port 3001)...
start "LeadFinder - Backend" cmd /k "cd /d "%~dp0server" && npx ts-node-dev --respawn --transpile-only src/index.ts"
timeout /t 3 /nobreak >nul
echo [2/2] Starting Frontend (port 5173)...
start "LeadFinder - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"
echo.
echo LeadFinder is starting...
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Opening browser...
timeout /t 4 /nobreak >nul
start http://localhost:5173

