import { useState, useRef, useEffect } from 'react';

/**
 * 채팅 애플리케이션을 위한 커스텀 훅
 * @returns {Object} 채팅 관련 상태와 함수들
 */
export const useChats = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'youngwon',
      content: '안녕! 뭔가 궁금한 게 있어?',
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState({ id: null, content: '', sender: 'youngwon' });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 타임스탬프 생성 헬퍼
  const getTimestamp = () => {
    return new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: getTimestamp()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 환경 변수에서 API URL 가져오기 (없으면 로컬 개발 환경 기본값)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage.trim() }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // 타이핑 효과를 위해 메시지를 한 글자씩 표시
        const messageId = Date.now() + 1;
        const fullContent = data.response;
        
        // 타이핑 시작
        setIsTyping(true);
        setTypingMessage({
          id: messageId,
          content: '',
          sender: 'youngwon',
          timestamp: getTimestamp()
        });
        
        // 한 글자씩 추가하는 타이핑 효과
        let currentIndex = 0;
        const typingSpeed = 30; // 밀리초 (작을수록 빠름)
        
        const typeNextChar = () => {
          if (currentIndex < fullContent.length) {
            setTypingMessage(prev => ({
              ...prev,
              content: fullContent.substring(0, currentIndex + 1)
            }));
            currentIndex++;
            typingTimeoutRef.current = setTimeout(typeNextChar, typingSpeed);
          } else {
            // 타이핑 완료 - 메시지에 추가
            const botMessage = {
              id: messageId,
              sender: 'youngwon',
              content: fullContent,
              timestamp: getTimestamp()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            setTypingMessage({ id: null, content: '', sender: 'youngwon' });
          }
        };
        
        // 첫 글자부터 시작
        typeNextChar();
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'youngwon',
          content: '어? 뭔가 문제가 생겼네. 다시 시도해볼래?',
          timestamp: getTimestamp()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      let errorContent = '연결에 문제가 생겼어. 잠시 후 다시 시도해줘!';
      
      // 네트워크 오류인 경우 더 명확한 메시지
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        errorContent = `백엔드 서버에 연결할 수 없어.\nAPI URL: ${apiUrl}\n\n백엔드 서버가 실행 중인지 확인해봐!`;
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'youngwon',
        content: errorContent,
        timestamp: getTimestamp()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  // 컴포넌트 언마운트 시 타이핑 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    typingMessage,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    handleKeyPress
  };
};

