import React, { useState } from 'react';
import AppIcon from './AppIcon';
import WindowFrame from './WindowFrame';
import TextEditApp from '../apps/TextEditApp';
import FinderApp from '../apps/FinderApp';
import MusicApp from '../apps/MusicApp';
import AlbumApp from '../apps/AlbumApp';
import ChatsApp from '../apps/ChatsApp';
import PhotoBoothApp from '../apps/PhotoBoothApp';
import DinoGameApp from '../apps/DinoGameApp';
import { useSound } from '../hooks/useSound';
import styles from './Desktop.module.css';

function Desktop() {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [maximizedWindow, setMaximizedWindow] = useState(null);
  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });

  // 사운드 훅 사용
  const { playSound } = useSound(0.3);

  // 화면 크기를 가져오는 useEffect
  React.useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window !== 'undefined') {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  // openApp 이벤트 리스너 추가
  React.useEffect(() => {
    const handleOpenApp = (event) => {
      openApp(event.detail);
    };

    window.addEventListener('openApp', handleOpenApp);
    
    return () => {
      window.removeEventListener('openApp', handleOpenApp);
    };
  }, []);

  const openApp = (appType) => {
    // 같은 앱이 이미 열려있는지 확인
    const existingWindow = windows.find(window => window.appType === appType);
    if (existingWindow) {
      // 이미 열린 앱이 있으면 해당 창을 포커스
      focusApp(existingWindow.id);
      return;
    }
    
    const newWindow = {
      id: Date.now().toString(),
      appType,
      title: appType === 'Notepad' ? 'TextEdit' : appType === 'Music' ? 'Music' : appType === 'Album' ? 'Album' : appType === 'Chats' ? 'Chats' : appType === 'PhotoBooth' ? 'Photo Booth' : appType === 'DinoGame' ? 'Dino Game' : 'Macintosh HD',
      x: 100 + (windows.length * 30),
      y: 100 + (windows.length * 30),
      width: appType === 'Notepad' ? 500 : appType === 'Music' ? 400 : appType === 'Album' ? 800 : appType === 'Chats' ? 600 : appType === 'PhotoBooth' ? 600 : appType === 'DinoGame' ? 800 : 600,
      height: appType === 'Notepad' ? 360 : appType === 'Music' ? 700 : appType === 'Album' ? 600 : appType === 'Chats' ? 500 : appType === 'PhotoBooth' ? 500 : appType === 'DinoGame' ? 400 : 400,
      zIndex: nextZIndex
    };
    
    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    
    // 앱 열기 사운드 재생
    playSound('WindowOpen.mp3');
  };

  const closeApp = (id) => {
    setWindows(prev => prev.filter(window => window.id !== id));
    
    // 앱 닫기 사운드 재생
    playSound('WindowClose.mp3');
  };

  const focusApp = (id) => {
    setWindows(prev => prev.map(window => 
      window.id === id 
        ? { ...window, zIndex: nextZIndex }
        : window
    ));
    setNextZIndex(prev => prev + 1);
  };

  const maximizeApp = (id) => {
    console.log('maximizeApp called with id:', id);
    console.log('Current maximizedWindow:', maximizedWindow);
    
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        if (maximizedWindow === id) {
          // 원래 크기로 되돌리기
          console.log('Restoring window to original size');
          setMaximizedWindow(null);
          return {
            ...window,
            width: window.appType === 'Notepad' ? 500 : window.appType === 'Music' ? 400 : window.appType === 'PhotoBooth' ? 600 : window.appType === 'DinoGame' ? 800 : 600,
            height: window.appType === 'Notepad' ? 360 : window.appType === 'Music' ? 700 : window.appType === 'PhotoBooth' ? 500 : window.appType === 'DinoGame' ? 400 : 400,
            x: 100,
            y: 100
          };
        } else {
          // 최적 크기로 확대 (화면의 80% 크기)
          console.log('Maximizing window');
          setMaximizedWindow(id);
          
          const screenWidth = screenSize.width;
          const screenHeight = screenSize.height;
            
          console.log('Screen dimensions:', { screenWidth, screenHeight });
          
          const maxWidth = screenWidth * 0.8;
          const maxHeight = (screenHeight - 24) * 0.8;
          const centerX = (screenWidth - maxWidth) / 2;
          const centerY = (screenHeight - 24 - maxHeight) / 2;
          
          console.log('New dimensions:', { maxWidth, maxHeight, centerX, centerY });
          
          return {
            ...window,
            width: maxWidth,
            height: maxHeight,
            x: centerX,
            y: centerY
          };
        }
      }
      return window;
    }));
  };

  const resizeApp = (id, newWidth, newHeight, newX = null, newY = null) => {
    setWindows(prev => prev.map(window => 
      window.id === id 
        ? { 
            ...window, 
            width: newWidth, 
            height: newHeight,
            ...(newX !== null && { x: newX }),
            ...(newY !== null && { y: newY })
          }
        : window
    ));
  };

  const renderApp = (appType) => {
    switch (appType) {
      case 'Notepad':
        return <TextEditApp />;
      case 'Finder':
        return <FinderApp onOpenApp={openApp} />;
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
      default:
        return <div>Unknown App</div>;
    }
  };

  return (
    <div className={styles.desktop}>
      {/* Desktop Icons */}
      <div className={styles.desktopIcons}>
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
          iconSrc="/icon/포토부스.png"
          appName="Photo Booth"
          onDoubleClick={() => openApp('PhotoBooth')}
        />
        <AppIcon
          iconSrc="/icon/공룡게임.svg"
          appName="Dino Game"
          onDoubleClick={() => openApp('DinoGame')}
        />
        <AppIcon
          iconSrc="/icon/음악 앱.png"
          appName="Music"
          onDoubleClick={() => openApp('Music')}
        />
        <AppIcon
          iconSrc="/icon/앨범 앱.png"
          appName="Album"
          onDoubleClick={() => openApp('Album')}
        />
        <AppIcon
          iconSrc="/icon/text.png"
          appName="TextEdit"
          onDoubleClick={() => openApp('Notepad')}
        />
      </div>

      {/* Windows */}
      {windows.map(window => (
        <WindowFrame
          key={window.id}
          title={window.title}
          x={window.x}
          y={window.y}
          width={window.width}
          height={window.height}
          zIndex={window.zIndex}
          isMaximized={maximizedWindow === window.id}
          onClose={() => closeApp(window.id)}
          onFocus={() => focusApp(window.id)}
          onMaximize={() => maximizeApp(window.id)}
          onResize={(newWidth, newHeight, newX, newY) => resizeApp(window.id, newWidth, newHeight, newX, newY)}
        >
          {renderApp(window.appType)}
        </WindowFrame>
      ))}
    </div>
  );
}

export default Desktop;
