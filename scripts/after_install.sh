#!/bin/bash
set -e

echo "Running after install script..."

# 환경변수 설정 (Parameter Store에서 가져오기)
if command -v aws &> /dev/null; then
    echo "Fetching configuration from Parameter Store..."
    API_URL=$(aws ssm get-parameter --name /myapp/frontend/api-url --query 'Parameter.Value' --output text 2>/dev/null || echo "http://localhost:8000")
    
    # config.js 생성
    echo "Generating config.js..."
    cat > /var/www/html/config.js <<EOF
window.APP_CONFIG = {
  API_URL: '${API_URL}'
}
EOF
    echo "Config generated with API_URL: $API_URL"
else
    echo "AWS CLI not found. Using default config."
fi

# 기존 default 설정 비활성화
echo "Disabling default Nginx config..."
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Nginx 설정
echo "Configuring Nginx..."
sudo tee /etc/nginx/conf.d/frontend.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name localhost www.yooniquespace.cloud;
    root /var/www/html;
    index index.html;

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Health check - 파일 기반
    location = /health {
        access_log off;
        default_type text/plain;
        try_files /health =404;
    }
    
    # Health check - 응답 기반 (백업)
    location = /health-check {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # API 프록시 (선택사항)
    # location /api {
    #     proxy_pass http://backend:8000;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # }
}
EOF

# Nginx 설정 테스트
echo "Testing Nginx configuration..."
sudo nginx -t

# 권한 설정
echo "Setting permissions..."
sudo chown -R nginx:nginx /var/www/html
sudo chmod -R 755 /var/www/html
sudo find /var/www/html -type f -exec chmod 644 {} \;

echo "After install completed"
exit 0
