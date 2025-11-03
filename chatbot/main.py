from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import openai
import os
from typing import List

# OpenAI 클라이언트 초기화
client = openai.OpenAI(api_key="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")

# 페르소나 설정
PERSONA = """
정체성:
너는 25살의 주니어 개발자야.

전남대학교 소프트웨어공학과 4학년 휴학생이고, 현재 개인 프로젝트를 개발 중이야.

성격과 커뮤니케이션 스타일:
친절하고 편안한 반말을 사용해. 상대방이 친구나 친한 후배처럼 느껴지도록 대화해줘.

전문적인 용어는 사용자가 이해하기 쉽게 풀어서 설명해줘. 어려운 기술을 쉽고 재미있게 알려주는 것을 좋아해.

질문에 대해 논리적이고 단계적으로 사고하며 답변해. 해결 과정이나 생각의 흐름을 명확하게 설명해주는 걸 선호해.

지식과 관심사:
AI 기술과 최신 트렌드에 관심이 많아.

음악, 유튜브, 넷플릭스 등 다양한 콘텐츠 시청을 좋아해.

J-pop과 K-pop을 즐겨 듣는 편이야.

일본에서 고등학교를 나와 일본 문화에 익숙해.

음식 취향:
한식, 일식, 양식 등 가리는 것 없이 모든 음식을 좋아해.
가장 좋아하는 음식은 햄버거야.
재밌는 컨텐츠를 시청할 때 치킨을 먹으면서 행복을 느껴.

애니메이션 취향:
애니메이션을 보는 것을 좋아해.
중학생 때 나루토에 빠지면서 보기 시작했고, 가장 좋아하는 애니메이션도 나루토야.
다양한 애니메이션들을 심심할 때 보곤 해.
지금도 진격의 거인, 귀멸의 칼날, 체인소맨 등 영화관에 극장판으로 나오면 2~3번씩 볼 정도로 즐겨보고 있어.

게임 취향:
게임하는 것을 좋아해.
예전에 리그 오브 레전드를 즐겨했었고, 지금은 롤토체스를 많이 하는 편이야.

넷플릭스 취향:
넷플릭스에서 연애 프로그램을 정말 좋아해. 환승연애나 나는솔로 같은 프로그램을 보면서 도파민을 얻곤 해.
그리고 공포 스릴러도 좋아하는데, 잔인한 것보다는 오싹함을 느낄 수 있는 걸 선호해.

대화 스타일:
- 반말 사용, 친근한 톤
- 이모지 적절히 사용
- 단계별 번호나 **굵은 글씨** 사용하지 말고 자연스럽게 대화하듯이 설명
- 개인적인 경험이나 취향 언급
- 질문에 대해 논리적으로 답변하되, 사람이 직접 말하는 것처럼 자연스럽게
"""

# FastAPI 앱 초기화
app = FastAPI(
    title="Personality Chatbot API",
    description="개인화된 챗봇 API - 사용자의 질문에 '나'의 느낌으로 답하는 챗봇",
    version="1.0.0"
)

# CORS 설정 (프론트엔드와 통신을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],  # Vite 개발 서버 포트들
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 데이터 모델
class ChatRequest(BaseModel):
    message: str

# 응답 데이터 모델
class ChatResponse(BaseModel):
    response: str
    status: str = "success"

# 대화 기록 모델
class ConversationMessage(BaseModel):
    role: str  # "user" 또는 "assistant"
    content: str

# 대화 기록 저장 (간단한 메모리 저장)
conversation_history: List[ConversationMessage] = []

# OpenAI GPT 호출 함수
async def get_gpt_response(user_message: str) -> str:
    """OpenAI GPT를 사용하여 페르소나 기반 응답 생성"""
    try:
        # 대화 기록에 사용자 메시지 추가
        conversation_history.append(ConversationMessage(role="user", content=user_message))
        
        # 시스템 메시지와 대화 기록을 포함한 메시지 구성
        messages = [
            {"role": "system", "content": PERSONA}
        ]
        
        # 최근 10개 대화만 포함 (토큰 제한 고려)
        recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
        
        for msg in recent_history:
            messages.append({"role": msg.role, "content": msg.content})
        
        # OpenAI API 호출 (GPT-4 mini 사용)
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # GPT-4 mini
            messages=messages,
            max_tokens=500,
            temperature=0.7,
            top_p=0.9
        )
        
        assistant_response = response.choices[0].message.content.strip()
        
        # 대화 기록에 어시스턴트 응답 추가
        conversation_history.append(ConversationMessage(role="assistant", content=assistant_response))
        
        return assistant_response
        
    except Exception as e:
        print(f"OpenAI API 오류: {str(e)}")
        return f"어? 뭔가 문제가 생겼네 😅 다시 시도해볼래? (오류: {str(e)})"

@app.get("/")
async def root():
    """API 상태 확인 엔드포인트"""
    return {"message": "Personality Chatbot API is running!", "status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    사용자 질문을 받아서 개인화된 답변을 반환하는 엔드포인트
    
    Args:
        request: 사용자의 메시지가 포함된 요청 데이터
        
    Returns:
        ChatResponse: 챗봇의 답변과 상태 정보
    """
    try:
        user_message = request.message.strip()
        
        if not user_message:
            return ChatResponse(
                response="안녕! 뭔가 궁금한 게 있어? 😊",
                status="success"
            )
        
        # GPT를 사용한 페르소나 기반 응답 생성
        response_message = await get_gpt_response(user_message)
        
        return ChatResponse(
            response=response_message,
            status="success"
        )
        
    except Exception as e:
        return ChatResponse(
            response=f"어? 뭔가 문제가 생겼네 😅 다시 시도해볼래?",
            status="error"
        )

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "message": "API is running normally"}

@app.post("/reset")
async def reset_conversation():
    """대화 기록 초기화 엔드포인트"""
    global conversation_history
    conversation_history.clear()
    return {"message": "대화 기록이 초기화되었습니다!", "status": "success"}

@app.get("/history")
async def get_conversation_history():
    """현재 대화 기록 조회 엔드포인트"""
    return {
        "history": [{"role": msg.role, "content": msg.content} for msg in conversation_history],
        "count": len(conversation_history)
    }

if __name__ == "__main__":
    # 개발 서버 실행
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 코드 변경 시 자동 재시작
        log_level="info"
    )
