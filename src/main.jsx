import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '/App.jsx';

// 챗봇 서버 워밍업 (Render 무료 플랜 콜드 스타트 대응)
const warmupChatServer = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    await fetch(`${apiUrl}/health`, { method: 'GET' });
    console.log('Chatbot server warmed up');
  } catch (error) {
    // 실패해도 무시 (서버가 깨어나는 중일 수 있음)
    console.log('Chatbot server warming up...');
  }
};

// 앱 시작 시 백그라운드로 서버 워밍업
warmupChatServer();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);


