@echo off
echo Killing old log windows...
taskkill /FI "WINDOWTITLE eq MySQL Logs*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend Logs*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Logs*" /T /F >nul 2>&1

echo Stopping and removing old containers...
docker compose down

echo Starting containers...
docker compose up -d

echo Opening new log windows...
start cmd /k "title MySQL Logs & docker logs -f vse-mysql"
start cmd /k "title Backend Logs & docker logs -f vse-backend"
start cmd /k "title Frontend Logs & docker logs -f vse-frontend"

echo Deployment complete!
