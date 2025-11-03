# Personality Chatbot API

사용자의 질문에 '나'의 느낌으로 답하는 개인화된 챗봇 API입니다.

## 🚀 설치 및 실행

### 1. 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. 서버 실행
```bash
python3 main.py
```

또는

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 API 엔드포인트

### GET `/`
- API 상태 확인
- 응답: `{"message": "Personality Chatbot API is running!", "status": "healthy"}`

### POST `/chat`
- 챗봇과 대화
- 요청 본문:
  ```json
  {
    "message": "안녕하세요!"
  }
  ```
- 응답:
  ```json
  {
    "response": "You said: 안녕하세요!",
    "status": "success"
  }
  ```

### GET `/health`
- 헬스 체크
- 응답: `{"status": "healthy", "message": "API is running normally"}`

### POST `/reset`
- 대화 기록 초기화
- 응답: `{"message": "대화 기록이 초기화되었습니다!", "status": "success"}`

### GET `/history`
- 현재 대화 기록 조회
- 응답: `{"history": [...], "count": 5}`

## 🔧 개발 환경

- **Python**: 3.8+
- **FastAPI**: 0.104.1
- **Uvicorn**: 0.24.0

## 📝 다음 단계 (준비됨)

1. ✅ 기본 API 구조 완성
2. ✅ 대화 기록 저장 기능
3. 🔄 페르소나 설정 (준비 중)
4. 🔄 LLM 연결 (준비 중)
5. 🔄 프론트엔드 연동 (준비 중)

## 💡 LLM 연결 준비사항

나중에 LLM을 연결할 때 필요한 것들:
- OpenAI API 키
- 페르소나 프롬프트 설정
- `get_gpt_response()` 함수 구현

