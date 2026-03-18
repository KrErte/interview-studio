#!/bin/bash
set -e

echo "=== CareerRisk.ee Deploy ==="

APP_DIR="/root/interview-studio"

# Clone or pull
if [ -d "$APP_DIR" ]; then
  echo ">> Pulling latest code..."
  cd "$APP_DIR"
  git pull origin main
else
  echo ">> Cloning repository..."
  cd /root
  git clone https://github.com/KrErte/interview-studio.git
  cd "$APP_DIR"
fi

# Stop old containers
echo ">> Stopping old containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start
echo ">> Building and starting services..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for health
echo ">> Waiting for backend health check..."
sleep 10
for i in $(seq 1 30); do
  if curl -sf http://localhost:8082/actuator/health > /dev/null 2>&1; then
    echo ">> Backend healthy!"
    break
  fi
  echo "   Waiting... ($i/30)"
  sleep 5
done

# Setup Caddy if not configured
if ! grep -q "careerrisk.ee" /etc/caddy/Caddyfile 2>/dev/null; then
  echo ">> Setting up Caddy reverse proxy..."
  cat > /etc/caddy/Caddyfile << 'CADDY'
careerrisk.ee, www.careerrisk.ee {
    reverse_proxy localhost:4201
}
CADDY
  systemctl reload caddy
  echo ">> Caddy configured for careerrisk.ee"
fi

echo ""
echo "=== Deploy complete ==="
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Site: https://careerrisk.ee"
