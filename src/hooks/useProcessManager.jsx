import { useState, useCallback } from 'react';
import React from 'react';
import TextEditApp from '../apps/TextEditApp';
import FinderApp from '../apps/FinderApp';
import MusicApp from '../apps/MusicApp';
import AlbumApp from '../apps/AlbumApp';
import ChatsApp from '../apps/ChatsApp';
import PhotoBoothApp from '../apps/PhotoBoothApp';
import DinoGameApp from '../apps/DinoGameApp';
import InternetApp from '../apps/InternetApp';
import TerminalApp from '../apps/TerminalApp';

/**
 * ProcessManager - 앱 실행, 종료, 렌더링 관리
 *
 * 앱 설정 레지스트리: 각 앱의 기본 설정 (제목, 크기 등)
 * 프로세스 상태: 실행 중인 앱 목록
 */

// 앱 설정 레지스트리
const APP_CONFIG = {
  Notepad: {
    title: 'TextEdit',
    defaultWidth: 500,
    defaultHeight: 360,
    icon: '/icon/text.png',
  },
  Finder: {
    title: 'Macintosh HD',
    defaultWidth: 430,
    defaultHeight: 320,
    icon: '/icon/Macintosh_HD 아이콘.webp',
  },
  Music: {
    title: 'Music',
    defaultWidth: 400,
    defaultHeight: 700,
    icon: '/icon/음악 앱.png',
  },
  Album: {
    title: 'Album',
    defaultWidth: 800,
    defaultHeight: 600,
    icon: '/icon/앨범 앱.png',
  },
  Chats: {
    title: 'Chats',
    defaultWidth: 600,
    defaultHeight: 500,
    icon: '/icon/맥 chat.png',
  },
  PhotoBooth: {
    title: 'Photo Booth',
    defaultWidth: 600,
    defaultHeight: 500,
    icon: '/icon/포토부스.png',
  },
  DinoGame: {
    title: 'Dino Game',
    defaultWidth: 800,
    defaultHeight: 400,
    icon: '/icon/공룡게임.svg',
  },
  Internet: {
    title: 'Internet',
    defaultWidth: 900,
    defaultHeight: 700,
    icon: '/icon/internet.png',
  },
  Terminal: {
    title: 'Terminal',
    defaultWidth: 700,
    defaultHeight: 500,
    icon: '/icon/terminal.png',
  },
};

function useProcessManager() {
  const [processes, setProcesses] = useState([]);

  // 앱 실행
  const launch = useCallback((appType, options = {}) => {
    const processId = `process-${Date.now()}`;
    const config = APP_CONFIG[appType] || { title: appType, defaultWidth: 600, defaultHeight: 400 };

    const newProcess = {
      id: processId,
      appType,
      title: options.title || config.title,
      isRunning: true,
      state: null, // 나중에 앱 상태 저장용
      initialPath: options.initialPath || null, // Finder용 초기 경로
    };

    setProcesses(prev => [...prev, newProcess]);

    return newProcess;
  }, []);

  // 앱 종료
  const terminate = useCallback((processId) => {
    setProcesses(prev => prev.filter(p => p.id !== processId));
  }, []);

  // 프로세스 정보 조회
  const getProcess = useCallback((processId) => {
    return processes.find(p => p.id === processId);
  }, [processes]);

  // appType으로 실행 중인 프로세스 찾기
  const findByAppType = useCallback((appType) => {
    return processes.find(p => p.appType === appType && p.isRunning);
  }, [processes]);

  // 앱 설정 조회
  const getConfig = useCallback((appType) => {
    return APP_CONFIG[appType] || { title: appType, defaultWidth: 600, defaultHeight: 400 };
  }, []);

  // 앱 컴포넌트 렌더링
  const renderApp = useCallback((processId, onOpenApp) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return null;

    switch (process.appType) {
      case 'Notepad':
        return <TextEditApp />;
      case 'Finder':
        return <FinderApp onOpenApp={onOpenApp} initialPath={process.initialPath} />;
      case 'Music':
        return <MusicApp />;
      case 'Album':
        return <AlbumApp />;
      case 'Chats':
        return <ChatsApp />;
      case 'PhotoBooth':
        return <PhotoBoothApp />;
      case 'DinoGame':
        return <DinoGameApp />;
      case 'Internet':
        return <InternetApp />;
      case 'Terminal':
        return <TerminalApp />;
      default:
        return <div>Unknown App</div>;
    }
  }, [processes]);

  return {
    processes,
    launch,
    terminate,
    getProcess,
    findByAppType,
    getConfig,
    renderApp,
  };
}

export { APP_CONFIG };
export default useProcessManager;
