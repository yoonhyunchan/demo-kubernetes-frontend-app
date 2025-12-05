#!/bin/bash
set -e

echo "Stopping Nginx..."

# Nginx가 실행 중인지 확인
if systemctl is-active --quiet nginx; then
    echo "Nginx is running. Stopping..."
    sudo systemctl stop nginx
    echo "Nginx stopped successfully"
else
    echo "Nginx is not running"
fi

exit 0
