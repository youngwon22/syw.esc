# 전체 배포 가이드 (프론트엔드 + 백엔드 분리)

## 아키텍처 구조

```
사용자 브라우저
    ↓
Vercel (프론트엔드)
    ↓ HTTP 요청
Render (백엔드 API)
    ↓ OpenAI API
OpenAI GPT
```

## 배포 순서

### 1단계: 백엔드 배포 (Render)

#### Render 서비스 생성
1. [Render.com](https://render.com) 가입/로그인
2. Dashboard → **"New +"** → **"Web Service"**
3. GitHub 저장소 연결: `youngwon22/syw.esc`

#### 서비스 설정
- **Name**: `syw-esc-chatbot` (원하는 이름)
- **Region**: `Singapore` (또는 원하는 지역)
- **Branch**: `main`
- **Runtime**: `Python 3`
- **Python Version**: `3.11` (중요!)
- **Build Command**: `pip install --upgrade pip wheel setuptools && pip install --only-binary :all: -r chatbot/requirements.txt || pip install -r chatbot/requirements.txt`
- **Start Command**: `cd chatbot && uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 환경 변수 설정 (Render)
**Environment Variables** 섹션:
1. **OPENAI_API_KEY**
   - Value: `여기에_당신의_OpenAI_API_키_입력`

2. **ALLOWED_ORIGINS** (임시로 로컬 추가)
   - Value: `http://localhost:5173` (나중에 Vercel URL 추가)

#### 배포 완료 확인
- 배포 완료 후 URL 확인 (예: `https://syw-esc-chatbot.onrender.com`)
- 브라우저에서 `https://your-backend-url.onrender.com/health` 접속해서 정상 작동 확인

---

### 2단계: 프론트엔드 배포 (Vercel)

#### Vercel 프로젝트 연결
1. [Vercel.com](https://vercel.com) 로그인
2. Dashboard → **"Add New..."** → **"Project"**
3. GitHub 저장소 선택: `youngwon22/syw.esc`
4. Vercel이 자동으로 설정을 감지합니다

#### 프로젝트 설정 확인
- **Framework Preset**: `Vite` (자동 감지)
- **Root Directory**: `./` (프로젝트 루트)
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `dist` (기본값)
- **Install Command**: `npm install` (기본값)

#### 환경 변수 설정 (Vercel)
**Settings** → **Environment Variables**에서 추가:

1. **VITE_API_URL**
   - Value: Render 백엔드 URL (예: `https://syw-esc-chatbot.onrender.com`)
   - **중요**: 모든 환경(Production, Preview, Development)에 적용

#### 배포
1. 설정 완료 후 **"Deploy"** 클릭
2. 배포 완료 후 Vercel URL 확인 (예: `https://syw-esc.vercel.app`)

---

### 3단계: CORS 설정 업데이트 (Render)

배포 후 Render의 환경 변수를 업데이트:

1. Render Dashboard → 서비스 → **Environment** 탭
2. **ALLOWED_ORIGINS** 수정:
   - Value: `https://your-vercel-app.vercel.app,http://localhost:5173`
   - 여러 URL은 쉼표로 구분
3. **Save Changes** → Render가 자동 재배포

---

## 배포 후 확인 체크리스트

### 백엔드 (Render)
- [ ] `https://your-backend.onrender.com/health` 접속 시 정상 응답
- [ ] `https://your-backend.onrender.com/` 접속 시 API 상태 확인

### 프론트엔드 (Vercel)
- [ ] Vercel 배포 URL에서 앱이 정상 로드
- [ ] Chats 앱 열기
- [ ] 메시지 전송 테스트
- [ ] 챗봇 응답 정상 확인

### 연결 확인
- [ ] 브라우저 개발자 도구(F12) → Network 탭에서 `/chat` 요청 확인
- [ ] 요청이 Render 백엔드로 전송되는지 확인
- [ ] CORS 오류 없는지 확인

---

## 환경 변수 요약

### Render (백엔드)
```
OPENAI_API_KEY=sk-proj-...
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

### Vercel (프론트엔드)
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 문제 해결

### 백엔드 연결 실패
1. **CORS 오류**: Render의 `ALLOWED_ORIGINS`에 Vercel URL이 포함되어 있는지 확인
2. **404 오류**: Vercel의 `VITE_API_URL`이 올바른지 확인
3. **타임아웃**: Render 무료 플랜은 15분 비활성 시 슬립 모드 (첫 요청 시 30초~1분 소요)

### 프론트엔드 오류
1. **환경 변수 미적용**: Vercel에서 환경 변수 설정 후 재배포 필요
2. **빌드 실패**: `package.json` 확인 및 로컬에서 `npm run build` 테스트

### 개발 환경 (로컬)
- 백엔드: `http://localhost:8000`
- 프론트엔드: `http://localhost:5173`
- 환경 변수 불필요 (기본값 사용)

---

## 배포 플로우

```
1. 코드 수정
   ↓
2. Git commit & push
   ↓
3. Render 자동 재배포 (백엔드)
   ↓
4. Vercel 자동 재배포 (프론트엔드)
   ↓
5. 완료! 🎉
```

**참고**: 
- GitHub에 푸시하면 Render와 Vercel 모두 자동으로 재배포됩니다
- 환경 변수 변경 시에는 수동 재배포가 필요할 수 있습니다

---

## 비용

- **Vercel**: 무료 플랜 (충분함)
- **Render**: 무료 플랜 (15분 비활성 시 슬립 모드)

둘 다 무료로 시작 가능합니다! 🚀

