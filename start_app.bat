@echo off
echo ==============================================
echo  SMART RESUME ANALYZER - FULL STACK LAUNCHER
echo ==============================================

:: -------------------------------------------------------
:: STEP 1: Auto-detect JAVA_HOME from wherever javac lives
:: -------------------------------------------------------
echo [Setup] Detecting Java installation...
for /f "delims=" %%i in ('where javac 2^>nul') do (
    set "JAVAC_PATH=%%i"
    goto :found_java
)

:: If 'where javac' failed, search common install paths
for %%d in (
    "C:\Program Files\Java"
    "C:\Program Files\Eclipse Adoptium"
    "C:\Program Files\Microsoft"
    "C:\Program Files\OpenJDK"
) do (
    for /d %%j in ("%%~d\jdk*") do (
        if exist "%%j\bin\javac.exe" (
            set "JAVAC_PATH=%%j\bin\javac.exe"
            goto :found_java
        )
    )
)

echo [ERROR] Java JDK not found. Please install Java 17+ and try again.
echo         Download from: https://adoptium.net/
pause
exit /b 1

:found_java
:: Strip "\bin\javac.exe" to get the JDK root
for %%i in ("%JAVAC_PATH%") do set "BIN_DIR=%%~dpi"
set "JAVA_HOME=%BIN_DIR:~0,-1%"
for %%i in ("%JAVA_HOME%") do set "JAVA_HOME=%%~dpi"
set "JAVA_HOME=%JAVA_HOME:~0,-1%"
echo [Setup] Found Java at: %JAVA_HOME%

:: -------------------------------------------------------
:: STEP 2: Decide which Maven to use (global or portable)
:: -------------------------------------------------------
echo [Setup] Detecting Maven...
where mvn >nul 2>&1
if %errorlevel% == 0 (
    set "MVN_CMD=mvn"
    echo [Setup] Using global Maven.
) else if exist "project-backend\apache-maven-3.9.9\bin\mvn.cmd" (
    set "MVN_CMD=.\apache-maven-3.9.9\bin\mvn.cmd"
    echo [Setup] Using portable Maven from project-backend folder.
) else (
    echo [ERROR] Maven not found. Please install Maven or run: 
    echo         cd project-backend ^&^& run the portable maven download command.
    pause
    exit /b 1
)

echo.
echo ==============================================
echo  All checks passed! Booting up all 3 services
echo ==============================================
echo.

:: -------------------------------------------------------
:: STEP 3: Launch all 3 services in parallel
:: -------------------------------------------------------
echo [1/3] Starting Python AI Microservice (Port 8000)...
start cmd /k "cd project-ai && .\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo [2/3] Starting Java Spring Boot Backend (Port 8080)...
start powershell -NoExit -Command "cd project-backend; $env:JAVA_HOME='%JAVA_HOME%'; %MVN_CMD% spring-boot:run"

echo [3/3] Starting React Frontend (Port 3000)...
start cmd /k "cd project-frontend && npm run dev"

echo.
echo ==============================================
echo  All 3 services are booting in separate windows!
echo  Wait ~30 seconds for Java to start, then open:
echo.
echo       http://localhost:3000
echo ==============================================
pause
