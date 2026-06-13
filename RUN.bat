@echo off
echo ==========================================
echo   Cinema Dashboard - Starting Server
echo ==========================================
echo.
cd /d C:\Users\Rezio\Desktop\Oracle-Project\cinema-dashboard\backend
start "Cinema Backend Server" cmd /k "node server.js"
echo Server window opened.
echo Waiting for server to start...
timeout /t 3 /nobreak > nul
start http://localhost:5000
echo.
echo Browser opened at http://localhost:5000
echo.
echo IMPORTANT: Keep the server window open.
echo If the dashboard does not load, refresh the browser.
echo.
pause
