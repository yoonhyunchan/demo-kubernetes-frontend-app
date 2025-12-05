#!/bin/bash
set -e

echo "Starting Nginx..."

# Nginx 시작
sudo systemctl start nginx

# 부팅 시 자동 시작 설정
sudo systemctl enable nginx

echo "Nginx started successfully"

# 상태 확인
sudo systemctl status nginx --no-pager

exit 0
