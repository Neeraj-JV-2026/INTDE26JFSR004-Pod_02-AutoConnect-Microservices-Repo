@echo off
title AutoConnect Microservices Starter (9 services) - Fresh Build Mode

REM ── Move to the folder containing this batch file (autoconnect root) ──
pushd %~dp0

echo ==========================================
echo   AutoConnect Microservices Launcher (CLEAN BUILD)
echo   Root: %~dp0
echo ==========================================
echo.

REM ─────────────────────────────────────────
REM CHECK MAVEN
REM ─────────────────────────────────────────
where mvn >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven not found in PATH.
    pause
    exit /b 1
)

REM ─────────────────────────────────────────
REM 1. EUREKA SERVER  (port 8761)
REM ─────────────────────────────────────────
echo [1/9] Starting Eureka Server...
start "Eureka Server" cmd /k "cd /d "%~dp0eureka-server" && mvn clean spring-boot:run || pause"

echo Waiting 35 seconds for Eureka to be ready...
timeout /t 35 /nobreak

REM ─────────────────────────────────────────
REM 2. USER SERVICE  (port 8082)
REM ─────────────────────────────────────────
echo [2/9] Starting User Service...
start "User Service" cmd /k "cd /d "%~dp0user-service" && mvn clean spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 3. CUSTOMER SERVICE  (port 8083)
REM ─────────────────────────────────────────
echo [3/9] Starting Customer Service...
start "Customer Service" cmd /k "cd /d "%~dp0customer-service" && mvn clean spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 4. INVENTORY SERVICE  (port 8085)
REM ─────────────────────────────────────────
echo [4/9] Starting Inventory Service...
start "Inventory Service" cmd /k "cd /d "%~dp0inventory-service" && mvn clean spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 5. SALES SERVICE  (port 8084)
REM ─────────────────────────────────────────
echo [5/9] Starting Sales Service...
start "Sales Service" cmd /k "cd /d "%~dp0sales-service" && mvn clean spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 6. FINANCE SERVICE  (port 8086)
### ─────────────────────────────────────────
echo [6/9] Starting Finance Service...
start "Finance Service" cmd /k "cd /d "%~dp0finance-service" && mvn clean spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 7. SERVICE MANAGEMENT SERVICE  (port 8081)
REM ─────────────────────────────────────────
echo [7/9] Starting Service Management Service...
start "Service Management" cmd /k "cd /d "%~dp0service-management-service" && mvn clean spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 8. NOTIFICATION SERVICE  (port 8090)
REM ─────────────────────────────────────────
echo [8/9] Starting Notification Service...
start "Notification Service" cmd /k "cd /d "%~dp0notification-service" && mvn clean spring-boot:run || pause"

echo.
echo Waiting 30 seconds for all services to register with Eureka...
timeout /t 30 /nobreak

REM ─────────────────────────────────────────
REM 9. API GATEWAY  (port 8089)
REM ─────────────────────────────────────────
echo [9/9] Starting API Gateway...
start "API Gateway" cmd /k "cd /d "%~dp0api-gateway" && mvn clean spring-boot:run || pause"

REM ... [Rest of the script remains the same] ...
echo.
echo ==========================================
echo   All services are recompiling and starting.
echo ==========================================
pause

popd