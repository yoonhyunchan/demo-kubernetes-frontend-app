#!/bin/bash
set -e

echo "Running before install script..."

# 기존 파일 백업
if [ -d "/var/www/html" ]; then
    echo "Backing up existing files..."
    BACKUP_DIR="/var/www/html_backup_$(date +%Y%m%d_%H%M%S)"
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r /var/www/html/* "$BACKUP_DIR/" 2>/dev/null || true
    echo "Backup created at $BACKUP_DIR"
    
    # 기존 파일 삭제 (index.html 제외 - 다운타임 최소화)
    echo "Cleaning up old files..."
    sudo find /var/www/html -mindepth 1 ! -name 'index.html' -delete 2>/dev/null || true
fi

# 디렉토리 생성
echo "Creating directories..."
sudo mkdir -p /var/www/html
sudo mkdir -p /var/log/nginx

# Nginx 설치 확인
if ! command -v nginx &> /dev/null; then
    echo "Nginx not found. Installing..."
    sudo yum install -y nginx || sudo apt-get install -y nginx
fi

sudo sed -i '/server {/,/}/d' /etc/nginx/nginx.conf

echo "Before install completed"
exit 0
