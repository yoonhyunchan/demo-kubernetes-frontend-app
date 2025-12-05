# Frontend - AWS Test Platform

## 기술 스택

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (아이콘)

## 설치 및 실행

### 개발 환경

```bash
cd frontend
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 VITE_API_URL 설정

npm run dev
```

프론트엔드는 http://localhost:3000 에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 환경변수 설정

`.env` 파일:

```env
VITE_API_URL=http://localhost:8000
```

**프로덕션:**
```env
VITE_API_URL=https://your-api-domain.com
```

## 빌드 가이드 (AWS CodeBuild)

### 1. 기본 빌드 (Artifact 생성)

**파일:** `buildspec.yml`

**환경변수 설정:**
```bash
# CodeBuild 프로젝트에서 설정
API_URL=https://api.production.com
```

### 2. S3 직접 배포

**사전 준비:**

S3 버킷 생성:
```bash
aws s3 mb s3://my-frontend-bucket
aws s3 website s3://my-frontend-bucket --index-document index.html
```

Parameter Store 설정:
```bash
aws ssm put-parameter \
  --name /myapp/frontend/api-url \
  --value "https://api.production.com" \
  --type String
```

### 3. Docker 이미지 빌드

ECR 리포지토리 생성:
```bash
aws ecr create-repository --repository-name my-frontend-repo
```

### CodeBuild 프로젝트 생성

```bash
aws codebuild create-project \
  --name frontend-build \
  --source type=GITHUB,location=https://github.com/user/repo.git \
  --artifacts type=S3,location=my-build-artifacts-bucket \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::123456789012:role/CodeBuildServiceRole \
  --buildspec frontend/buildspec.yml
```

## 배포 가이드 (AWS CodeDeploy)

### 사전 준비

**EC2 인스턴스 설정:**

CodeDeploy Agent 설치:
```bash
sudo yum update -y
sudo yum install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent start
```

Nginx 설치:
```bash
sudo yum install -y nginx
sudo systemctl enable nginx
```

### CodeDeploy 애플리케이션 생성

```bash
aws deploy create-application \
  --application-name frontend-app \
  --compute-platform Server

aws deploy create-deployment-group \
  --application-name frontend-app \
  --deployment-group-name production \
  --service-role-arn arn:aws:iam::123456789012:role/CodeDeployServiceRole \
  --ec2-tag-filters Key=Name,Value=frontend-server,Type=KEY_AND_VALUE \
  --deployment-config-name CodeDeployDefault.OneAtATime
```

### 배포 실행

```bash
# S3에 업로드
aws deploy push \
  --application-name frontend-app \
  --s3-location s3://my-deployment-bucket/frontend.zip \
  --source ./frontend/dist

# 배포 생성
aws deploy create-deployment \
  --application-name frontend-app \
  --deployment-group-name production \
  --s3-location bucket=my-deployment-bucket,key=frontend.zip,bundleType=zip
```

### 배포 파이프라인

```
GitHub/CodeCommit
    ↓
CodeBuild (buildspec.yml)
    ↓
CodeDeploy (appspec.yml)
    ↓
EC2 인스턴스 (Nginx)
```

## Health Check

### 엔드포인트

```bash
curl http://localhost/health
# 응답: OK
```

### Nginx 설정

`nginx.conf`에 이미 포함되어 있습니다:

```nginx
location /health {
    access_log off;
    return 200 "OK\n";
    add_header Content-Type text/plain;
}
```

### AWS Application Load Balancer

```bash
Health check path: /health
Health check protocol: HTTP
Healthy threshold: 2
Unhealthy threshold: 2
Timeout: 5 seconds
Interval: 30 seconds
```

## 트러블슈팅

### 빌드 실패 시

```bash
# CloudWatch Logs 확인
aws logs tail /aws/codebuild/frontend-build --follow
```

### 배포 실패 시

```bash
# CodeDeploy Agent 확인
sudo service codedeploy-agent status
sudo service codedeploy-agent restart

# 배포 로그 확인
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/     # 공통 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # API 서비스
│   ├── App.jsx
│   └── main.jsx
├── scripts/            # 배포 스크립트
├── appspec.yml         # CodeDeploy 설정
├── buildspec.yml       # CodeBuild 설정
├── nginx.conf          # Nginx 설정
└── Dockerfile          # Docker 이미지 빌드
```

## 참고 자료

- [Vite 문서](https://vitejs.dev/)
- [React Router 문서](https://reactrouter.com/)
- [AWS CodeBuild 문서](https://docs.aws.amazon.com/codebuild/)
- [AWS CodeDeploy 문서](https://docs.aws.amazon.com/codedeploy/)
