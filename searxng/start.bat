@echo off
cd /d "%~dp0"
echo Starting SearXNG on http://localhost:18889 ...
docker compose up -d
echo.
echo Done! Point SEARXNG_INSTANCE_URL=http://localhost:18889 in your env.
