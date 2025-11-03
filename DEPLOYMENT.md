# 배포 가이드

## Vercel 프론트엔드 배포

### 1. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

- `VITE_API_URL`: 백엔드 API URL (예: `https://your-backend.railway.app`)

### 2. 자동 배포

GitHub에 푸시하면 Vercel이 자동으로 배포합니다.

## 백엔드 배포 옵션

Python FastAPI 백엔드는 Vercel에서 직접 실행할 수 없습니다. 다음 옵션 중 하나를 선택하세요:

### 옵션 1: Railway 배포 (권장)

1. [Railway](https://railway.app)에 가입
2. "New Project" → "Deploy from GitHub repo" 선택
3. `syw.esc` 저장소 선택
4. Root Directory를 `chatbot`으로 설정
5. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `ALLOWED_ORIGINS`: Vercel 배포 URL (예: `https://your-app.vercel.app`)
6. 배포 후 생성된 URL을 `VITE_API_URL`에 설정

### 옵션 2: Render 배포

1. [Render](https://render.com)에 가입
2. "New Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `chatbot`
5. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `ALLOWED_ORIGINS`: Vercel 배포 URL

### 옵션 3: Fly.io 배포

1. [Fly.io](https://fly.io) CLI 설치 및 로그인
2. `chatbot` 폴더에서:
   ```bash
   fly launch
   ```
3. 환경 변수 설정:
   ```bash
   fly secrets set OPENAI_API_KEY=your_key
   fly secrets set ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

## 로컬 개발 설정

### 백엔드 실행

```bash
cd chatbot
source venv/bin/activate
export OPENAI_API_KEY=your_api_key
export ALLOWED_ORIGINS=http://localhost:5173
python main.py
```

### 프론트엔드 실행

```bash
npm run dev
```

`.env` 파일을 사용할 수도 있습니다:

**프로젝트 루트 `.env`:**
```
VITE_API_URL=http://localhost:8000
```

**`chatbot/.env`:**
```
OPENAI_API_KEY=your_api_key
ALLOWED_ORIGINS=http://localhost:5173
```

