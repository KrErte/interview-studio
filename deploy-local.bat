@echo off
echo === Deploying to careerrisk.ee ===
"C:\Windows\System32\OpenSSH\ssh.exe" careerrisk "cd /root/interview-studio && git pull origin main && docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up --build -d"
echo === Done ===
