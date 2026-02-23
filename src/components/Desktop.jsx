import React, { useState, useCallback, useRef } from 'react';
import AppIcon from './AppIcon';
import WindowFrame from './WindowFrame';
import Dock from './Dock';
import useWindowManager from '../hooks/useWindowManager';
import useProcessManager from '../hooks/useProcessManager.jsx';
import { useSound } from '../hooks/useSound';
import styles from './Desktop.module.css';

function Desktop() {
  const windowManager = useWindowManager();
  const processManager = useProcessManager();
  const { playSound } = useSound(0.3);

  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });

  // processId -> windowId 매핑 (같은 앱 중복 방지용)
  const processWindowMap = useRef(new Map());

  // 화면 크기 추적
  React.useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window !== 'undefined') {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  // 앱 열기
  const openApp = useCallback((appType, options = {}) => {
    // 이미 열린 앱 확인 (initialPath가 다르면 새 창 허용)
    if (!options.initialPath) {
      const existingProcess = processManager.findByAppType(appType);
      if (existingProcess) {
        const existingWindowId = processWindowMap.current.get(existingProcess.id);
        if (existingWindowId) {
          windowManager.focus(existingWindowId);
          return;
        }
      }
    }

    // 프로세스 시작
    const process = processManager.launch(appType, options);
    const config = processManager.getConfig(appType);

    // 창 위치 계산
    let x, y;

    if (appType === 'Internet') {
      // 인터넷 앱은 화면 중앙에 배치
      x = Math.max(0, (screenSize.width - config.defaultWidth) / 2);
      y = Math.max(0, (screenSize.height - config.defaultHeight) / 2 - 80);
    } else {
      // 나머지 앱들은 왼쪽 위에서 시작 + Cascade
      const baseX = 30; // 왼쪽 초기 패딩
      const baseY = 30; // 위쪽 초기 패딩
      const cascadeOffsetX = windowManager.windows.length * 40; // 왼쪽으로 40px씩
      const cascadeOffsetY = windowManager.windows.length * 32; // 위쪽으로 타이틀바 높이만큼
      x = baseX + cascadeOffsetX;
      y = baseY + cascadeOffsetY;
    }

    const windowId = windowManager.create(process.id, {
      width: config.defaultWidth,
      height: config.defaultHeight,
      x,
      y,
    });

    // 매핑 저장
    processWindowMap.current.set(process.id, windowId);

    // 사운드 재생
    playSound('WindowOpen.mp3');
  }, [windowManager, processManager, playSound]);

  // 휴지통 열기
  const openTrash = useCallback(() => {
    openApp('Finder', { initialPath: '/Trash', title: 'Trash' });
  }, [openApp]);

  // 앱 닫기
  const closeApp = useCallback((windowId) => {
    const win = windowManager.getWindow(windowId);
    if (win) {
      processManager.terminate(win.processId);
      processWindowMap.current.delete(win.processId);
    }
    windowManager.close(windowId);

    // 사운드 재생
    playSound('WindowClose.mp3');
  }, [windowManager, processManager, playSound]);

  // openApp 이벤트 리스너
  React.useEffect(() => {
    const handleOpenApp = (event) => {
      openApp(event.detail);
    };

    window.addEventListener('openApp', handleOpenApp);

    return () => {
      window.removeEventListener('openApp', handleOpenApp);
    };
  }, [openApp]);

  return (
    <div className={styles.desktop}>
      {/* Desktop Icons */}
      <div className={styles.desktopIcons}>
        {/* 첫 번째 열 (오른쪽) */}
        <div className={styles.iconColumn}>
          <AppIcon
            iconSrc="/icon/Macintosh_HD 아이콘.webp"
            appName="Macintosh HD"
            onDoubleClick={() => openApp('Finder')}
          />
          <AppIcon
            iconSrc="/icon/맥 chat.png"
            appName="Chats"
            onDoubleClick={() => openApp('Chats')}
          />
          <AppIcon
            iconSrc="/icon/internet.png"
            appName="Internet"
            onDoubleClick={() => openApp('Internet')}
          />
          <AppIcon
            iconSrc="/icon/음악 앱.png"
            appName="Music"
            onDoubleClick={() => openApp('Music')}
          />
          <AppIcon
            iconSrc="/icon/포토부스.png"
            appName="Photo Booth"
            onDoubleClick={() => openApp('PhotoBooth')}
          />
          <AppIcon
            iconSrc="/icon/앨범 앱.png"
            appName="Album"
            onDoubleClick={() => openApp('Album')}
          />
        </div>
        {/* 두 번째 열 (왼쪽) */}
        <div className={styles.iconColumn}>
          <AppIcon
            iconSrc="/icon/text.png"
            appName="TextEdit"
            onDoubleClick={() => openApp('Notepad')}
          />
          <AppIcon
            iconSrc="/icon/공룡게임.svg"
            appName="Dino Game"
            onDoubleClick={() => openApp('DinoGame')}
          />
          <AppIcon
            iconSrc="/icon/terminal.png"
            appName="Terminal"
            onDoubleClick={() => openApp('Terminal')}
          />
        </div>
      </div>

      {/* Dock */}
      <Dock
        onOpenApp={openApp}
        onOpenTrash={openTrash}
        runningApps={processManager.processes.map(p => p.appType)}
      />

      {/* Windows */}
      {windowManager.windows.map(win => {
        const process = processManager.getProcess(win.processId);
        if (!process) return null;

        return (
          <WindowFrame
            key={win.id}
            title={process.title}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            zIndex={win.zIndex}
            isMaximized={win.isMaximized}
            isFocused={win.isFocused}
            isDimmed={win.isDimmed}
            onClose={() => closeApp(win.id)}
            onFocus={() => windowManager.focus(win.id)}
            onMaximize={() => windowManager.maximize(win.id, screenSize)}
            onResize={(newWidth, newHeight, newX, newY) =>
              windowManager.update(win.id, {
                width: newWidth,
                height: newHeight,
                ...(newX !== null && newX !== undefined && { x: newX }),
                ...(newY !== null && newY !== undefined && { y: newY }),
              })
            }
          >
            {processManager.renderApp(win.processId, openApp)}
          </WindowFrame>
        );
      })}
    </div>
  );
}

export default Desktop;
