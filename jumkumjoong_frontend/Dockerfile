# ⚡ 1. React 빌드 단계
FROM node:24-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json만 복사 후 의존성 설치 (최적화)
COPY package.json package-lock.json ./
RUN npm install --production  # 필요 시 개발 의존성 제외

# 소스 코드 복사 후 빌드 실행
COPY . . 
RUN npm run build

# 🏃‍♂️ 2. EC2에서 사용할 배포용 컨테이너
FROM alpine:latest

WORKDIR /app

# 빌드 결과물을 /var/www/html/로 복사하기 위해 tar 사용
COPY --from=builder /app/build /app/build
RUN tar -czf build.tar.gz -C /app/build .  # 압축하여 build.tar.gz 생성

# EC2로 전송할 준비 완료 메시지
CMD ["sh", "-c", "echo 'React build files are ready. Copy build.tar.gz to EC2 and extract to /var/www/html/'"]
