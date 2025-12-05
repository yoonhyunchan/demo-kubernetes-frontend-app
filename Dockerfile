# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 환경변수 설정 (빌드 시점)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# 빌드
RUN npm run build

# Production stage
FROM nginx:alpine

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
