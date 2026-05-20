@echo off
cd /d "%~dp0"
docker compose restart
echo SearXNG restarted.
