#!/bin/bash
set -e

echo "Validating service..."

# Nginx 실행 확인
if ! systemctl is-active --quiet nginx; then
    echo "ERROR: Nginx is not running"
    systemctl status nginx --no-pager || true
    exit 1
fi

echo "✓ Nginx is running"

# Nginx 설정 테스트
echo "Testing Nginx configuration..."
nginx -t 2>&1 || {
    echo "ERROR: Nginx configuration is invalid"
    exit 1
}
echo "✓ Nginx configuration is valid"

# 포트 리스닝 확인
echo "Checking if Nginx is listening on port 80..."
if netstat -tuln | grep -q ':80 '; then
    echo "✓ Nginx is listening on port 80"
else
    echo "ERROR: Nginx is not listening on port 80"
    netstat -tuln | grep ':80' || echo "No process listening on port 80"
    exit 1
fi

# 파일 존재 확인
echo "Checking deployed files..."
if [ ! -f "/var/www/html/index.html" ]; then
    echo "ERROR: index.html not found"
    ls -la /var/www/html/ || true
    exit 1
fi
echo "✓ index.html exists"

# Health check 테스트
MAX_RETRIES=5
RETRY_COUNT=0
SLEEP_TIME=2

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES: Testing health endpoint..."
    
    # 상세한 curl 출력
    HTTP_CODE=$(curl -s -o /tmp/health_response.txt -w "%{http_code}" http://localhost/health-check 2>&1)
    
    echo "HTTP Status Code: $HTTP_CODE"
    echo "Response: $(cat /tmp/health_response.txt 2>/dev/null || echo 'No response')"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Health check passed"
        
        # index.html 접근 테스트
        if curl -f -s http://localhost/ > /dev/null 2>&1; then
            echo "✓ Application is accessible"
            echo "Validation successful!"
            exit 0
        else
            echo "⚠ Health check passed but root path failed"
            curl -v http://localhost/ 2>&1 | head -20
        fi
    else
        echo "✗ Health check failed"
        
        # 디버깅 정보
        if [ $RETRY_COUNT -eq 0 ]; then
            echo "=== Debug Information ==="
            echo "Nginx error log (last 10 lines):"
            tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log"
            echo ""
            echo "Nginx access log (last 5 lines):"
            tail -5 /var/log/nginx/access.log 2>/dev/null || echo "No access log"
            echo ""
            echo "Files in /var/www/html:"
            ls -la /var/www/html/ | head -20
            echo ""
            echo "Nginx config:"
            cat /etc/nginx/conf.d/frontend.conf 2>/dev/null || echo "Config not found"
        fi
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "Waiting ${SLEEP_TIME}s before retry..."
        sleep $SLEEP_TIME
    fi
done

echo "ERROR: Validation failed after $MAX_RETRIES attempts"
echo "=== Final Debug Info ==="
echo "Nginx status:"
systemctl status nginx --no-pager || true
echo ""
echo "Processes on port 80:"
lsof -i :80 2>/dev/null || netstat -tuln | grep ':80'
exit 1
