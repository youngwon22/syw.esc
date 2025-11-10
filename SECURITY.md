# 보안 구조 및 암호화 가이드

## 🔒 현재 보안 상태

### ✅ 잘 적용된 보안 조치

#### 1. **API 키 보호 (환경 변수 관리)**
```
✅ 상태: 안전하게 관리됨
```

**구조:**
- **로컬 개발**: `.env` 파일 사용 (Git에 커밋되지 않음)
- **Render 배포**: 환경 변수로 관리 (대시보드에서 설정)
- **Vercel 배포**: 환경 변수로 관리 (대시보드에서 설정)

**코드 구조:**
```python
# chatbot/main.py
api_key = os.getenv("OPENAI_API_KEY")  # 환경 변수에서 읽기
if not api_key:
    raise ValueError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.")
```

**보호 수준:**
- ✅ API 키가 코드에 하드코딩되지 않음
- ✅ `.gitignore`에 `.env` 파일 포함
- ✅ GitHub에 민감한 정보 노출 없음

#### 2. **CORS (Cross-Origin Resource Sharing) 보호**
```
✅ 상태: 적절히 설정됨
```

**구조:**
```python
# 환경 변수에서 허용된 origin만 받음
allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
# 기본값: localhost만 허용
```

**보호 수준:**
- ✅ 특정 도메인만 API 접근 허용
- ✅ 무단 도메인에서의 요청 차단
- ✅ 환경 변수로 관리 (유연한 설정)

#### 3. **HTTPS 통신**
```
✅ 상태: 자동 적용됨
```

**구조:**
- **Vercel**: `https://syw-esc.vercel.app` (자동 HTTPS)
- **Render**: `https://syw-esc-chatbot.onrender.com` (자동 HTTPS)

**보호 수준:**
- ✅ 모든 통신이 암호화됨
- ✅ 중간자 공격(MITM) 방지
- ✅ 데이터 전송 중 보호

#### 4. **Git 보안**
```
✅ 상태: 민감한 정보 제외됨
```

**구조:**
```gitignore
# .gitignore
.env
.env.local
.env.production
venv/
__pycache__/
```

**보호 수준:**
- ✅ `.env` 파일이 Git에 커밋되지 않음
- ✅ Python 가상환경 제외
- ✅ 빌드 아티팩트 제외

---

## 📊 보안 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                    사용자 브라우저                       │
│              (HTTPS 암호화 통신)                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Vercel (프론트엔드)                        │
│  - 환경 변수: VITE_API_URL                              │
│  - HTTPS 자동 적용                                      │
│  - 정적 파일만 제공                                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Render (백엔드 API)                        │
│  - 환경 변수: OPENAI_API_KEY (암호화 저장)              │
│  - CORS: 특정 origin만 허용                             │
│  - HTTPS 자동 적용                                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│              OpenAI API                                 │
│  - API 키로 인증                                         │
│  - HTTPS 통신                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 암호화 및 보안 레이어

### 레이어 1: 전송 계층 보안 (TLS/HTTPS)
- **위치**: 모든 통신 경로
- **방법**: HTTPS 프로토콜
- **보호**: 데이터 전송 중 암호화

### 레이어 2: 인증 및 권한
- **위치**: Render 백엔드
- **방법**: 
  - OpenAI API 키로 인증
  - CORS로 origin 제한
- **보호**: 무단 접근 차단

### 레이어 3: 환경 변수 보호
- **위치**: Render, Vercel 플랫폼
- **방법**: 
  - 플랫폼의 환경 변수 시스템 사용
  - 코드에 하드코딩하지 않음
- **보호**: API 키 노출 방지

### 레이어 4: 소스 코드 보호
- **위치**: Git 저장소
- **방법**: 
  - `.gitignore`로 민감한 파일 제외
  - GitHub Push Protection (자동 감지)
- **보호**: 저장소에 민감한 정보 커밋 방지

---

## ⚠️ 현재 보안 상태 요약

### ✅ 잘 보호되는 부분
1. **API 키**: 환경 변수로 안전하게 관리
2. **HTTPS**: 모든 통신 암호화
3. **CORS**: 특정 도메인만 허용
4. **Git**: 민감한 파일 제외

### ⚠️ 주의가 필요한 부분
1. **대화 기록**: 현재 메모리에만 저장 (서버 재시작 시 사라짐)
   - 개인정보가 포함될 수 있으므로 주의 필요
   - 현재는 문제 없음 (임시 저장만)

2. **API 키 로테이션**: 주기적으로 키 변경 권장
   - OpenAI 대시보드에서 새 키 생성 후 교체

3. **Rate Limiting**: 현재 제한 없음
   - 필요시 추가 가능 (비용 제어)

---

## 🛡️ 추가 보안 권장사항 (선택사항)

### 1. Rate Limiting 추가
```python
# chatbot/main.py에 추가 가능
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/chat")
@limiter.limit("10/minute")  # 분당 10회 제한
async def chat(...):
    ...
```

### 2. API 키 로테이션
- 주기적으로 OpenAI API 키 변경
- Render 환경 변수에서 업데이트

### 3. 로깅 및 모니터링
- 비정상적인 요청 패턴 감지
- Render 로그 확인

### 4. 입력 검증 강화
- 사용자 입력 sanitization
- SQL Injection 방지 (현재는 필요 없음 - DB 없음)

---

## 📝 보안 체크리스트

### 배포 전 확인
- [x] API 키가 코드에 하드코딩되지 않음
- [x] `.env` 파일이 `.gitignore`에 포함됨
- [x] CORS 설정이 적절함
- [x] HTTPS 사용 중
- [x] 환경 변수가 플랫폼에서 안전하게 설정됨

### 정기 점검
- [ ] API 키 주기적 변경 (3-6개월)
- [ ] 로그 확인 (비정상 패턴)
- [ ] 의존성 업데이트 (보안 패치)

---

## 🔍 보안 감사 결과

**전체 평가: ✅ 양호**

현재 프로젝트는 기본적인 보안 조치가 잘 적용되어 있습니다:
- 민감한 정보는 환경 변수로 관리
- HTTPS 통신 사용
- CORS로 접근 제어
- Git에 민감한 정보 노출 없음

**추가 개선 가능한 부분:**
- Rate Limiting (선택사항)
- 더 상세한 로깅 (선택사항)
- API 키 자동 로테이션 (선택사항)

---

## 📚 참고 자료

- [OpenAI API 보안 가이드](https://platform.openai.com/docs/guides/safety-best-practices)
- [FastAPI 보안 문서](https://fastapi.tiangolo.com/advanced/security/)
- [Vercel 환경 변수 보안](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render 환경 변수 보안](https://render.com/docs/environment-variables)

