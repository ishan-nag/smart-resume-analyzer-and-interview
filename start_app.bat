@echo off
echo ==============================================
echo  SMART RESUME ANALYZER - FULL STACK LAUNCHER
echo ==============================================

echo [1/3] Starting Python AI Microservice (Port 8000)...
start cmd /k "cd project-ai && .\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo [2/3] Starting Java Spring Boot Backend (Port 8080)...
start cmd /k "cd project-backend && set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot && .\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run"

echo [3/3] Starting React Frontend (Port 3000)...
start cmd /k "cd project-frontend && npm run dev"

echo.
echo ==============================================
echo  All 3 services are booting up in separate terminal windows!
echo  Wait about 20-30 seconds for Java to fully boot up, and then open:
echo.
echo  http://localhost:3000
echo ==============================================
pause
