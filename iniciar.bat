@echo off
start cmd /k "cd /d "C:\Users\giuli\Documents\focusflow" && npm start"
timeout /t 2 /nobreak >nul
start http://localhost:5173
