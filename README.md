
# 감정중

## https://gamjeongjung.co.kr
## 1️⃣ 서비스 소개

### 개요

- 전자기기 중고거래 플랫폼
- AI 기반 흠집 탐지 및 게시글 자동 생성성
- 서비스명 : 감정중

### 타겟층 🎯

- 중고 전자기기를 판매하고 구매하는 모든 사람

### UCC 📽️


### Presentation 📕


<br>

## 2️⃣기획 배경

### 배경

- 온라인 중고거래 구매 후, 나도 몰랐던 **흠집**이 있었다 ! 😢 미리 알려줘야 하는거 아닌가❓
- **전자기기에 하자가 어딨는지 꼼꼼히 확인하기 힘들어..**😨 


👉 그래서 **AI가 흠집 탐지도 해주고! 게시글도 자동 생성해주는 감정중**이 탄생했습니다! 💙

### 목적 ✅

전자기기 중고거래 판매자/구매자들의 편리성과 신뢰성을 가진 서비스를 만들자‼️

<br>

## 3️⃣기능 소개

### 📌AI기반 전자기기 촬영 각도 분류 기능
- 전자기기 촬영 후 전면/측면/후면 자동 분류
- Yolov8-Cls 모델을 활용하여 빠르고 정확한 분류 실행
---

### 📌AI기반 전자기기 흠집 탐지 기능
- 전자기기 전면/측면/후면의 흠집 탐지 후 흠집 개수 및 위치 안내
- Yolov8 Nano 모델을 활용하여 효율적으로 흠집 탐지
---

### 📌AI기반 판매 게시글 자동 생성 
- 간단 정보 입력 후 상세 정보를 AI가 작성해주는 판매 게시글 
- ChatGPT 4.0 모델을 활용하여 보다 자연스러운 문장 구사
---

### 📌판매자/구매자 간 실시간 채팅 기능 
- 실시간 통신  
- 메세지 수신유무 상태 파악 


## 4️⃣기술 스택
### BackEnd
- Java
- Python
- Spring Boot
- Spring JPA
- MySQL
- Redis
- Web Socket
- Elastic Search
- Amazon S3

### Frontend
- VisualStudioCode
- Node.js
- NPM
- TypeScript
- Tailwindcss
- PWA
- React
- Axios
- Zustand

### Infrastructure
- Gitlab WebHook
- Docker
- Jenkins
- Nginx
- Amazon EC2

## 5️⃣핵심 기술
### ✔️WebSocket
1. 
- 
2. 
- 

### ✔️Elastic Search
1. 검색 엔진 제공
- 유연한 검색 기능
2. 
- 


### ✔️AI 

1. Image Classification
- 노트북 부위 5가지 : front, back, screen, keyboard, side
- YOLOv8n-cls (Nano) 모델 기반으로 경량화된 분류 모델 학습
- 사용자 이미지가 어떤 부위인지 예측하여 후속 처리에 활용  
<br>  

2. Object Detection
- 전자기기 손상 유형 5종 : Damaged Keys, Damaged Screen, Display Issues, Scratch, Normal
- Roboflow에서 다운로드한 커스텀 데이터셋 사용
- YOLOv8n (Nano) 모델 기반으로 경량화된 탐지 모델 학습 및 적용
- 이미지 내 손상 위치와 유형을 박스 단위로 탐지하여 시각적으로 피드백하고, 후속 처리(게시글 자동 생성)에 활용  
<br>

3. AI Prompting
- 사용자가 입력한 모델명, 브랜드, 사용 기간, 희망 가격, 구성품 정보와 AI가 감지한 손상 상태(스크래치 위치 및 상태 점수) 및 기기 스펙 정보를 활용
- ChatGPT API(GPT-4-turbo)로 자연스럽고 신뢰감 있는 중고 거래 게시글 제목과 설명을 자동 생성
- 생성된 게시글은 프론트엔드에 자동 반영되어 사용자 편의성을 높임
<br>

<br>


<br>

## 6️⃣서비스 아키텍처
![architecture](./images/architecture.png)

<br>

## 7️⃣프로젝트 산출물
### 📌 ERD
![ERD](./images/gamjeongjung_ERD.png)
---

---

### 📌Figma

![FIGMA](./images/gamjeongjung_FIGMA.png)

---

### 📌 API 문서
[KaKao Login API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
