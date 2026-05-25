@echo off
title AutoConnect Microservices Starter

echo ==========================================
echo   Starting AutoConnect Microservices
echo ==========================================
echo.

REM =====================================================
REM CHECK MAVEN
REM =====================================================

where mvn >nul 2>nul

IF %ERRORLEVEL% NEQ 0 (
    echo Maven is NOT installed or not added to PATH
    echo Please install Maven and configure environment variables
    pause
    exit /b
)

REM =====================================================
REM START EUREKA SERVER
REM =====================================================

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd /d eureka-server && mvn spring-boot:run || pause"

echo Waiting for Eureka Server to start...
timeout /t 20

REM =====================================================
REM START USER SERVICE
REM =====================================================

echo Starting User Service...
start "User Service" cmd /k "cd /d user-service && mvn spring-boot:run || pause"

REM =====================================================
REM START CUSTOMER SERVICE
REM =====================================================

echo Starting Customer Service...
start "Customer Service" cmd /k "cd /d customer-service && mvn spring-boot:run || pause"

REM =====================================================
REM START INVENTORY SERVICE
REM =====================================================

echo Starting Inventory Service...
start "Inventory Service" cmd /k "cd /d inventory-service && mvn spring-boot:run || pause"

REM =====================================================
REM START SALES SERVICE
REM =====================================================

echo Starting Sales Service...
start "Sales Service" cmd /k "cd /d sales-service && mvn spring-boot:run || pause"

REM =====================================================
REM START SERVICE MANAGEMENT SERVICE
REM =====================================================

echo Starting Service Management Service...
start "Service Management Service" cmd /k "cd /d service-management-service && mvn spring-boot:run || pause"

REM =====================================================
REM START FINANCE SERVICE
REM =====================================================

echo Starting Finance Service...
start "Finance Service" cmd /k "cd /d finance-service && mvn spring-boot:run || pause"

REM =====================================================
REM WAIT BEFORE GATEWAY
REM =====================================================

echo Waiting before starting API Gateway...
timeout /t 15

REM =====================================================
REM START API GATEWAY
REM =====================================================

echo Starting API Gateway...
start "API Gateway" cmd /k "cd /d api-gateway && mvn spring-boot:run || pause"

REM =====================================================
REM DONE
REM =====================================================

echo.
echo ==========================================
echo All services are starting...
echo ==========================================
echo.

echo Eureka Dashboard:
echo http://localhost:8761

echo.
echo If any service fails, its terminal will stay open.
echo Check logs inside that terminal.
echo.

pause