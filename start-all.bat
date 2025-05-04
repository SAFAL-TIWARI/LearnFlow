@echo off
echo Starting LearnFlow Application...

:: Start the backend server in a new window
start cmd /k "cd server && node server.js"

:: Wait a moment for the server to start
timeout /t 3

:: Start the frontend
echo Starting frontend...
npm run dev

pause