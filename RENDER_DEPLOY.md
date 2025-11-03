# Render 배포 가이드

## 단계별 배포 방법

### 1. Render 계정 생성
1. [Render.com](https://render.com) 방문
2. GitHub 계정으로 가입/로그인

### 2. 새 Web Service 생성
1. Dashboard에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. **"Connect GitHub"** (처음이면 GitHub 권한 허용)
4. 저장소 선택: `youngwon22/syw.esc`

### 3. 서비스 설정

**기본 정보:**
- **Name**: `syw-esc-chatbot` (원하는 이름으로 변경 가능)
- **Region**: 선택 (서울 근처: Singapore 추천)
- **Branch**: `main`

**빌드 및 시작 명령어:**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r chatbot/requirements.txt`
- **Start Command**: `cd chatbot && uvicorn main:app --host 0.0.0.0 --port $PORT`

**고급 설정 (Advanced):**
- Root Directory: 비워두기 (프로젝트 루트 사용)

### 4. 환경 변수 설정

**Environment Variables** 섹션에서 추가:

1. **OPENAI_API_KEY**
   - Key: `OPENAI_API_KEY`
   - Value: `여기에_당신의_OpenAI_API_키_입력`

2. **ALLOWED_ORIGINS**
   - Key: `ALLOWED_ORIGINS`
   - Value: Vercel 배포 URL (예: `https://your-app.vercel.app,http://localhost:5173`)
   - 여러 URL은 쉼표로 구분

### 5. 배포 시작
1. 설정 완료 후 **"Create Web Service"** 클릭
2. 배포가 자동으로 시작됩니다 (약 5-10분 소요)

### 6. 배포 완료 후
1. 배포가 완료되면 **URL 확인** (예: `https://syw-esc-chatbot.onrender.com`)
2. Vercel 프로젝트 설정으로 이동
3. **Environment Variables**에 추가:
   - Key: `VITE_API_URL`
   - Value: Render 배포 URL (예: `https://syw-esc-chatbot.onrender.com`)
4. Vercel 재배포 또는 자동 재배포 대기

## 로컬 테스트

배포 전 로컬에서 테스트하려면:

```bash
cd chatbot
source venv/bin/activate
export OPENAI_API_KEY=your_api_key
export ALLOWED_ORIGINS=http://localhost:5173
python main.py
```

## 문제 해결

### 배포 실패 시
1. **Build Log** 확인
2. `requirements.txt`에 모든 패키지가 있는지 확인
3. Python 버전 확인 (3.8+)

### API 연결 안 될 때
1. Render 서비스가 실행 중인지 확인
2. `ALLOWED_ORIGINS`에 Vercel URL이 포함되어 있는지 확인
3. Vercel의 `VITE_API_URL`이 올바른지 확인

## 무료 플랜 제한사항
- 15분간 요청이 없으면 자동으로 슬립 모드로 전환
- 첫 요청 시 깨어나는 데 30초~1분 소요
- 월 사용량 제한 있음

## 참고사항
- Render는 GitHub에 푸시할 때마다 자동 재배포됩니다
- 환경 변수 변경 후에는 수동으로 재배포해야 할 수 있습니다
- 무료 플랜에서도 충분히 사용 가능합니다

