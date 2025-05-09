# ⚡ 1. React 빌드 단계
FROM node:24-alpine AS builder  

WORKDIR /app

# package.json만 복사 후 의존성 설치 (최적화)
COPY package.json package-lock.json ./
RUN npm install
RUN npm ci --production

# 소스 코드 복사 후 빌드 실행
COPY . .
RUN npm run build

# 🏃‍♂️ 2. EC2에서 사용할 배포용 컨테이너
FROM alpine:latest

# 빌드 결과물을 /var/www/html/로 복사하기 위해 tar 사용
WORKDIR /app
COPY --from=builder /app/build /app/build
RUN tar -czf build.tar.gz -C /app/build .

CMD ["sh", "-c", "echo 'React build files are ready. Copy build.tar.gz to EC2 and extract to /var/www/html/'"]