@echo off
title AutoConnect Microservices Starter

REM ── Move to the folder containing this batch file (autoconnect root) ──
pushd %~dp0

echo ==========================================
echo   AutoConnect Microservices Launcher
echo   Root: %~dp0
echo ==========================================
echo.

REM ─────────────────────────────────────────
REM CHECK MAVEN
REM ─────────────────────────────────────────
where mvn >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven not found in PATH.
    echo Please install Maven and add it to your environment variables.
    pause
    exit /b 1
)

REM ─────────────────────────────────────────
REM 1. EUREKA SERVER  (port 8761)
REM ─────────────────────────────────────────
echo [1/8] Starting Eureka Server...
start "Eureka Server" cmd /k "cd /d "%~dp0eureka-server" && mvn spring-boot:run || pause"

echo Waiting 35 seconds for Eureka to be ready...
timeout /t 35 /nobreak

REM ─────────────────────────────────────────
REM 2. USER SERVICE  (port 8082)
REM ─────────────────────────────────────────
echo [2/8] Starting User Service...
start "User Service" cmd /k "cd /d "%~dp0user-service" && mvn spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 3. CUSTOMER SERVICE  (port 8083)
REM ─────────────────────────────────────────
echo [3/8] Starting Customer Service...
start "Customer Service" cmd /k "cd /d "%~dp0customer-service" && mvn spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 4. INVENTORY SERVICE  (port 8085)
REM ─────────────────────────────────────────
echo [4/8] Starting Inventory Service...
start "Inventory Service" cmd /k "cd /d "%~dp0inventory-service" && mvn spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 5. SALES SERVICE  (port 8084)
REM ─────────────────────────────────────────
echo [5/8] Starting Sales Service...
start "Sales Service" cmd /k "cd /d "%~dp0sales-service" && mvn spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 6. FINANCE SERVICE  (port 8086)
REM ─────────────────────────────────────────
echo [6/8] Starting Finance Service...
start "Finance Service" cmd /k "cd /d "%~dp0finance-service" && mvn spring-boot:run || pause"
timeout /t 10 /nobreak

REM ─────────────────────────────────────────
REM 7. SERVICE MANAGEMENT SERVICE  (port 8081)
REM ─────────────────────────────────────────
echo [7/8] Starting Service Management Service...
start "Service Management" cmd /k "cd /d "%~dp0service-management-service" && mvn spring-boot:run || pause"

echo.
echo Waiting 40 seconds for all services to register with Eureka...
timeout /t 40 /nobreak

REM ─────────────────────────────────────────
REM 8. API GATEWAY  (port 8089)
REM ─────────────────────────────────────────
echo [8/8] Starting API Gateway...
start "API Gateway" cmd /k "cd /d "%~dp0api-gateway" && mvn clean spring-boot:run || pause"

REM ─────────────────────────────────────────
REM DONE
REM ─────────────────────────────────────────
echo.
echo ==========================================
echo   All services are starting up.
echo   Check each terminal window for status.
echo ==========================================
echo.
echo   Service URLs:
echo   -------------------------------------------
echo   Eureka Dashboard       : http://localhost:8761
echo   API Gateway            : http://localhost:8089
echo   -------------------------------------------
echo   User Service           : http://localhost:8082
echo   Customer Service       : http://localhost:8083
echo   Inventory Service      : http://localhost:8085
echo   Sales Service          : http://localhost:8084
echo   Finance Service        : http://localhost:8086
echo   Service Management     : http://localhost:8081
echo   -------------------------------------------
echo.
echo   All requests go through the gateway:
echo   POST http://localhost:8089/api/auth/register
echo   POST http://localhost:8089/api/auth/login
echo   GET  http://localhost:8089/api/customers   (Bearer token required)
echo.
echo   If a service window shows an error, check that
echo   terminal - the window stays open due to ^|^| pause
echo.
pause

popd
