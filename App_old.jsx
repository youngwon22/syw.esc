import React, { useEffect, useMemo, useRef, useState } from "react";

// click sound helper
function playClickSound() {
  try {
    const audio = new Audio('/sounds/Frog 1.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {}
}
// close sound helper
function playCloseSound() {
  try {
    const audio = new Audio('/sounds/Bottle 2.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {}
}
// dropdown close sound helper
function playDropdownCloseSound() {
  try {
    const audio = new Audio('/sounds/Frog 2.mp3');
    audio.volume = 0.35;
    audio.play().catch(() => {});
  } catch {}
}

// All-in-one file: App, MenuBar, Desktop (with draggable icons), Dock (with Stack effect), and CSS via <style>

const MENU_BAR_HEIGHT = 24; // px - 실제 맥북 메뉴바 높이에 맞춤
const DOCK_VISIBLE_HEIGHT = 64; // px - 앱 아이콘 크기에 맞춤
const DOCK_HIDDEN_OFFSET = 64; // px (how much the dock sits below the viewport when not hovered)

export default function App() {
  return (
    <div className="mac-root">
      <StyleElement />
      <MenuBar />
      <Desktop />
    </div>
  );
}

function StyleElement() {
  return (
    <style>{`
      :root {
        --menu-height: ${MENU_BAR_HEIGHT}px;
        --dock-height: ${DOCK_VISIBLE_HEIGHT}px;
        --dock-hidden-offset: ${DOCK_HIDDEN_OFFSET}px;
        --radius: 10px;
        --blur: 12px;
        --shadow: 0 10px 30px rgba(0,0,0,0.18);
        --text: #1d1d1f;
        --text-dim: #3c3c43;
        --surface: rgba(255,255,255,0.6);
        --surface-strong: rgba(255,255,255,0.85);
        --border: rgba(0,0,0,0.08);
        --accent: #0a84ff;
      }

      * { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
        color: var(--text);
        background: #0f1220;
      }

      .mac-root { height: 100vh; overflow: hidden; }

      /* MenuBar */
      .menu-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--menu-height);
        background-color: #c0c0c0;
        background-image: repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px);
        border-bottom: 2px solid #888;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 0 8px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .menu-group { display: flex; align-items: center; gap: 5px; }
      .menu-item {
        position: relative;
        padding: 4px 8px;
        border-radius: 4px;
        color: #1f1f1f;
        font-size: 12.5px;
        line-height: 1;
        cursor: default;
        font-weight: 500;
        text-shadow: none;
        letter-spacing: 0;
        transition: none;
      }
      .menu-item:hover { 
        background: none;
        box-shadow: none;
      }
      .menu-item.active { 
        background: none;
        box-shadow: none;
      }
      .menu-item .label { display: inline-flex; align-items: center; gap: 6px; }

      .apple-logo {
        width: 22px; height: 22px;
        display: inline-flex; align-items: center; justify-content: center;
        margin: -2px -4px -2px -4px;
        padding-top: 4px;
        align-self: flex-end;
      }
      .apple-logo img { filter: none; }

      .dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        min-width: 200px;
        padding: 6px;
        background-color: #c0c0c0;
        background-image: repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px);
        border: 1px solid #888;
        border-radius: 2px;
        box-shadow:
          0 6px 12px rgba(0,0,0,0.35),
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.08);
        z-index: 1100;
      }
      .dropdown-item {
        padding: 8px 12px;
        border-radius: 2px;
        font-size: 12.5px;
        color: #1f1f1f;
        font-weight: 500;
        text-shadow: none;
        transition: none;
      }
      .dropdown-item strong {
        color: #111;
        font-weight: 700;
        text-shadow: none;
      }
      .dropdown-item:hover {
        background: linear-gradient(180deg,
          rgba(0,122,255,0.25) 0%,
          rgba(0,122,255,0.15) 100%);
        box-shadow: none;
      }
              .dropdown-sep {
          height: 1px;
          background: #9a9a9a;
          margin: 6px 0;
        }
        
        .dropdown-title {
          background: linear-gradient(180deg, 
            rgba(255,255,255,0.9) 0%, 
            rgba(240,240,240,0.8) 30%, 
            rgba(220,220,220,0.7) 70%, 
            rgba(200,200,200,0.6) 100%);
          border-bottom: 1px solid #888;
          padding: 8px 12px;
          margin: -6px -6px 6px -6px;
          font-weight: 600;
          color: #333;
          text-align: left;
          border-radius: 2px 2px 0 0;
        }

      /* Desktop */
      .desktop {
        position: relative;
        height: calc(100vh - var(--menu-height));
        margin-top: var(--menu-height);
        background: url("배경화면.jpeg") center center / cover no-repeat;
        overflow: hidden;
      }
      .desktop-icons-layer { position: absolute; inset: 0; }
      .desktop-icon {
        position: absolute;
        width: 86px; text-align: center;
        cursor: default;
        display: flex; flex-direction: column; align-items: center;
      }
      .desktop-icon .icon-wrap {
        width: 86px; height: 86px; margin: 0; border-radius: 14px;
        display: grid; place-items: center;
        background: transparent;
        transition: transform .15s ease;
        cursor: pointer;
      }
      .icon-wrap:hover { transform: scale(1.06); }
      .desktop-icon .label { color: #e6e6e7; font-size: 12px; letter-spacing: 0.1px; font-family: "Monaco", "Geneva", "Lucida Grande", "Verdana", "Arial", sans-serif; text-shadow: 0 1px 2px rgba(0,0,0,0.6); margin-top: 2px; line-height: 1.1; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }

      /* Retro Window */
      .retro-window-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.12); z-index: 950; }
      .retro-window {
        position: fixed;
        background: #f6f6f6;
        border: 2px solid #888;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 1000;
        min-width: 320px;
        min-height: 220px;
      }
      .retro-window::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.08) 100%); mix-blend-mode: overlay; }
      .retro-title-bar {
        height: 23px;
        background: 
          linear-gradient(180deg, 
            rgba(255,255,255,0.9) 0%, 
            rgba(240,240,240,0.8) 30%, 
            rgba(220,220,220,0.7) 70%, 
            rgba(200,200,200,0.6) 100%),
          #c0c0c0;
        background-image: 
          linear-gradient(180deg, 
            rgba(255,255,255,0.9) 0%, 
            rgba(240,240,240,0.8) 30%, 
            rgba(220,220,220,0.7) 70%, 
            rgba(200,200,200,0.6) 100%),
          repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px);
        border-bottom: 2px solid #888;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8px;
        position: relative;
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.8),
          0 1px 3px rgba(0,0,0,0.1);
        cursor: move;
        user-select: none;
        z-index: 10;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .traffic {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: 4px;
      }
      
      .traffic .btn {
        width: 13px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.3);
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: radial-gradient(circle at 30% 30%, var(--btn-color), var(--btn-color-dark));
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.7),
          inset 0 -1px 0 rgba(0,0,0,0.2),
          0 1px 2px rgba(0,0,0,0.2),
          0 0 0 1px rgba(255,255,255,0.1);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }
      
      .traffic .btn::before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%);
        border-radius: 50%;
        filter: blur(0.3px);
      }
      
      .traffic .btn::after {
        content: '';
        position: absolute;
        bottom: 1px;
        right: 1px;
        width: 3px;
        height: 3px;
        background: radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 100%);
        border-radius: 50%;
        filter: blur(0.3px);
      }
      
      .traffic .btn.red {
        --btn-color: #ff5f57;
        --btn-color-dark: #ff4444;
      }
      
      .traffic .btn.yellow {
        --btn-color: #ffbd2e;
        --btn-color-dark: #ffb000;
      }
      
      .traffic .btn.green {
        --btn-color: #28ca42;
        --btn-color-dark: #24b33e;
      }
      
      .traffic .btn:hover {
        transform: scale(1.15);
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 2px 4px rgba(0,0,0,0.3),
          0 0 0 1px rgba(255,255,255,0.2);
      }
      
      .traffic .btn:active {
        transform: scale(0.92);
        box-shadow: 
          inset 0 1px 0 rgba(0,0,0,0.2),
          inset 0 -1px 0 rgba(255,255,255,0.1),
          0 1px 1px rgba(0,0,0,0.2);
      }
       
       .retro-title {
         position: absolute;
         left: 50%;
         transform: translateX(-50%);
         font-size: 12px;
         color: #333;
         font-weight: 600;
         text-shadow: 0 1px 0 rgba(255,255,255,0.8);
         pointer-events: none;
         letter-spacing: 0.2px;
       }
      .retro-editor {
        flex: 1;
        border: none;
        outline: none;
        background: #f6f6f6;
        color: #333;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        padding: 16px;
        resize: none;
        overflow: auto;
      }
      .resize-handle {
        position: absolute;
        background: transparent;
        z-index: 20;
      }
      .resize-handle.r { right: 0; top: 0; width: 6px; height: 100%; cursor: ew-resize; }
      .resize-handle.l { left: 0; top: 0; width: 6px; height: 100%; cursor: ew-resize; }
      .resize-handle.t { top: 0; left: 0; width: 100%; height: 6px; cursor: ns-resize; }
      .resize-handle.b { bottom: 0; left: 0; width: 100%; height: 6px; cursor: ns-resize; }
      .resize-handle.tr { top: 0; right: 0; width: 12px; height: 12px; cursor: ne-resize; }
      .resize-handle.tl { top: 0; left: 0; width: 12px; height: 12px; cursor: nw-resize; }
      .resize-handle.br { bottom: 0; right: 0; width: 12px; height: 12px; cursor: se-resize; }
              .resize-handle.bl { bottom: 0; left: 0; width: 12px; height: 12px; cursor: sw-resize; }

        /* TextEdit Toolbar */
        .textedit-toolbar {
          height: 35px;
          background: #e8e8e8;
          border-bottom: 1px solid #ccc;
          display: flex;
          align-items: center;
          padding: 0 8px;
          gap: 8px;
          flex-shrink: 0;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 4px;
          border-right: 1px solid #bbb;
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .toolbar-btn {
          width: 24px;
          height: 24px;
          border: 1px solid #999;
          background: linear-gradient(180deg, #f0f0f0 0%, #d0d0d0 100%);
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #333;
          transition: all 0.1s ease;
        }

        .toolbar-btn:hover {
          background: linear-gradient(180deg, #f8f8f8 0%, #e0e0e0 100%);
          border-color: #666;
        }

        .toolbar-btn:active {
          background: linear-gradient(180deg, #d0d0d0 0%, #b0b0b0 100%);
          transform: translateY(1px);
        }

        .toolbar-btn.active {
          background: linear-gradient(180deg, #c0c0c0 0%, #a0a0a0 100%);
          border-color: #555;
        }

        .toolbar-dropdown {
          height: 24px;
          border: 1px solid #999;
          background: linear-gradient(180deg, #f0f0f0 0%, #d0d0d0 100%);
          border-radius: 3px;
          padding: 0 6px;
          font-size: 11px;
          color: #333;
          cursor: pointer;
        }

        .textedit-content {
          flex: 1;
          background: #f6f6f6;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .align-left::before { content: '☰'; }
        .align-center::before { content: '☰'; }
        .align-right::before { content: '☰'; }

        /* Custom Scrollbar Styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #555 #2a2a2a;
        }

      `}</style>
  );
}

function MenuBar() {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [seoulTimeText, setSeoulTimeText] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const openRef = useRef(null);
  useEffect(() => { openRef.current = openMenuKey; }, [openMenuKey]);

  useEffect(() => {
    function formatSeoul() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      // Replace spaces to create a mac-like compact look
      const s = formatter.format(now).replaceAll(" ", "");
      setSeoulTimeText(s);
    }
    formatSeoul();
    const id = setInterval(formatSeoul, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function updateCurrentDateTime() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      });
      const dayStr = now.toLocaleDateString('ko-KR', {
        weekday: 'short'
      });
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setCurrentDateTime(`${dateStr} (${dayStr}) ${timeStr}`);
    }
    updateCurrentDateTime();
    const id = setInterval(updateCurrentDateTime, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      const item = e.target?.closest?.('.menu-item');
      if (!item) {
        if (openRef.current != null) playDropdownCloseSound();
        setOpenMenuKey(null);
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') {
        if (openRef.current != null) playDropdownCloseSound();
        setOpenMenuKey(null);
      }
    }
    document.addEventListener('click', onDocClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, []);

  const menus = useMemo(
    () => [
      { key: 'apple', label: (<AppleLogo />), dropdown: (
        <div>
          <div className="dropdown-item"><strong>오늘</strong></div>
          <div className="dropdown-item">{seoulTimeText} (KST)</div>
        </div>
      )},
              { key: 'youngwon', label: <strong style={{fontWeight: '700'}}>Youngwon</strong>, dropdown: (
          <div>
            <div className="dropdown-title">About me</div>
            <div className="dropdown-item">
              <strong style={{color: '#666', fontSize: '11px'}}>Name</strong><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>Youngwon Song</div>
            </div>
            <div className="dropdown-sep" />
            <div className="dropdown-item">
              <strong style={{color: '#666', fontSize: '11px'}}>Birth</strong><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>2001 / 03 / 11</div>
            </div>
            <div className="dropdown-sep" />
            <div className="dropdown-item">
              <strong style={{color: '#666', fontSize: '11px'}}>Major</strong><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>Software (2020~)</div>
            </div>
            <div className="dropdown-sep" />
            <div className="dropdown-item">
              <strong style={{color: '#666', fontSize: '11px'}}>Hobby</strong><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>Music, Anime, Game</div>
            </div>
          </div>
        )},
      ...['File', 'Edit', 'View', 'Help'].map((name) => ({
        key: name.toLowerCase(),
        label: name,
        dropdown: (
          <div>
            <div className="dropdown-item">empty</div>
          </div>
        )
      }))
    ], [seoulTimeText]
  );

  return (
    <div className="menu-bar">
      <div className="menu-group">
        {menus.map((m) => (
          <div
            key={m.key}
            className={`menu-item ${openMenuKey === m.key ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setOpenMenuKey((prev) => {
                if (prev != null && prev !== m.key) {
                  // switching menus: previous dropdown disappears
                  playDropdownCloseSound();
                }
                if (prev === m.key) {
                  // closing the same dropdown
                  playDropdownCloseSound();
                  return null;
                }
                return m.key;
              });
            }}
          >
            <span className="label">{m.label}</span>
            {openMenuKey === m.key && (
              <div className="dropdown" onClick={(e)=>e.stopPropagation()} onMouseDown={(e)=>e.stopPropagation()}>{m.dropdown}</div>
            )}
          </div>
        ))}
      </div>
      <div className="menu-group" style={{marginLeft: 'auto'}}>
        <div className="menu-item" style={{cursor: 'default', color: '#333', fontWeight: '500'}}>
          <span style={{fontWeight: '600', color: '#222'}}>
            {currentDateTime.split(' (')[0]}
          </span>
          <span style={{fontWeight: '500', color: '#333'}}>
            {currentDateTime.includes(' (') ? ` (${currentDateTime.split(' (')[1].split(' ')[0]}` : ''}
          </span>
          <span style={{fontWeight: '600', color: '#222'}}>
            {currentDateTime.includes(' ') ? ` ${currentDateTime.split(' ').slice(-1)[0]}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

function AppleLogo() {
  return (
    <span className="apple-logo" aria-label="Apple">
              <img src="파란사과이미지.png" alt="Apple" width="22" height="22" />
    </span>
  );
}

function Desktop() {
  // 전역 창 관리 상태
  const [windows, setWindows] = useState([]);
  const [nextWindowId, setNextWindowId] = useState(1);

  // 창 관리 함수들
  const openWindow = (appType, title) => {
    const newWindow = {
      id: nextWindowId,
      appType,
      title,
      position: { x: 100 + (nextWindowId * 30), y: 100 + (nextWindowId * 30) },
      size: { w: 400, h: 300 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextWindowId
    };
    setWindows(prev => [...prev, newWindow]);
    setNextWindowId(prev => prev + 1);
  };

  const closeWindow = (id) => {
    setWindows(prev => prev.filter(window => window.id !== id));
  };

  const moveWindow = (id, position) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, position } : window
    ));
  };

  const resizeWindow = (id, size) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, size } : window
    ));
  };

  const minimizeWindow = (id) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isMinimized: !window.isMinimized } : window
    ));
  };

  const maximizeWindow = (id) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isMaximized: !window.isMaximized } : window
    ));
  };

  const focusWindow = (id) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, zIndex: nextWindowId } : window
    ));
    setNextWindowId(prev => prev + 1);
  };

  // 앱 컴포넌트 렌더링 함수
  const renderApp = (appType) => {
    switch (appType) {
      case 'file':
        return <FileApp />;
      case 'textedit':
        return <TextEditApp />;
      case 'music':
        return <MusicApp />;
      default:
        return <div>알 수 없는 앱</div>;
    }
  };

  const editorRef = useRef(null);
  
  // Music app states
  const initialPlaylist = [
    { videoId: 'SIuF37EWaLU', title: '東京フラッシュ', artist: 'Vaundy' },
    { videoId: '1FIhcdocT-k', title: '恋風邪にのせて', artist: 'Vaundy' },
    { videoId: 'XYepTo2hnBQ', title: 'Famous', artist: 'ALLDAY PROJECT' },
    { videoId: 'bNKXxwOQYB8', title: 'EASY', artist: 'LE SSERAFIM (르세라핌)' },
    { videoId: 's984zMNLL2o', title: 'シャッター', artist: '優里' }
  ];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [musicWinSize, setMusicWinSize] = useState({ w: 400, h: 700 });
  const [musicWinPos, setMusicWinPos] = useState({ x: 150, y: 150 });
  const musicDragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const musicResizeRef = useRef({ resizing: false, direction: 'corner', startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 });
  
  // TextEdit app states
  const [textEditWinSize, setTextEditWinSize] = useState({ w: 350, h: 300 });
  const [textEditWinPos, setTextEditWinPos] = useState({ x: 200, y: 200 });
  const textEditDragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const textEditResizeRef = useRef({ resizing: false, direction: 'corner', startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 });
  const [textEditText, setTextEditText] = useState("");
  const textEditEditorRef = useRef(null);
  
  // TextEdit formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [textAlign, setTextAlign] = useState('left');
  
  // Function to handle list insertion for TextEdit
  const insertList = (type) => {
    if (!textEditEditorRef.current) return;
    
    const textarea = textEditEditorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textEditText.substring(start, end);
    
    let newText;
    if (type === 'ul') {
      newText = selectedText.split('\n').map(line => line.trim() ? `• ${line}` : line).join('\n');
    } else {
      newText = selectedText.split('\n').map((line, index) => line.trim() ? `${index + 1}. ${line}` : line).join('\n');
    }
    
    const beforeText = textEditText.substring(0, start);
    const afterText = textEditText.substring(end);
    setTextEditText(beforeText + newText + afterText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + newText.length;
      textarea.focus();
    }, 0);
  };

  useEffect(() => {
    if (fileAppOpen && !isMinimized) {
      setTimeout(() => editorRef.current?.focus(), 0);
    }
  }, [fileAppOpen, isMinimized]);

  // Music app resize and drag handlers
  useEffect(() => {
    function onMusicMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (musicDragRef.current.dragging) {
        const newX = clientX - musicDragRef.current.offsetX;
        const newY = clientY - musicDragRef.current.offsetY;
        const maxX = window.innerWidth - musicWinSize.w - 8;
        const maxY = window.innerHeight - musicWinSize.h - 8;
        setMusicWinPos({
          x: Math.max(8, Math.min(maxX, newX)),
          y: Math.max(8 + MENU_BAR_HEIGHT, Math.min(maxY, newY)),
        });
      }
      
      if (musicResizeRef.current.resizing) {
        const dx = clientX - musicResizeRef.current.startX;
        const minW = 350; const margin = 8;
        const dir = musicResizeRef.current.direction;
        const startW = musicResizeRef.current.startW;
        const startLeft = musicResizeRef.current.startLeft;

        let nextX = musicWinPos.x;
        let nextW = musicWinSize.w;
        const nextH = 700; // 높이 고정

        const maxRightW = window.innerWidth - startLeft - margin;

        // 가로 너비만 조절 가능
        if (dir === 'right' || dir === 'tr' || dir === 'br') {
          nextW = Math.max(minW, Math.min(maxRightW, startW + dx));
        }
        if (dir === 'left' || dir === 'tl' || dir === 'bl') {
          const tmpX = startLeft + dx;
          const minXAllowed = margin;
          const maxXAllowed = startLeft + startW - minW;
          nextX = Math.max(minXAllowed, Math.min(maxXAllowed, tmpX));
          nextW = startW + (startLeft - nextX);
        }

        setMusicWinPos({ x: nextX, y: musicWinPos.y });
        setMusicWinSize({ w: nextW, h: nextH });
      }
    }
    
    function onMusicUp() {
      musicDragRef.current.dragging = false;
      musicResizeRef.current.resizing = false;
    }
    
    window.addEventListener('mousemove', onMusicMove);
    window.addEventListener('mouseup', onMusicUp);
    window.addEventListener('touchmove', onMusicMove, { passive: false });
    window.addEventListener('touchend', onMusicUp);
    return () => {
      window.removeEventListener('mousemove', onMusicMove);
      window.removeEventListener('mouseup', onMusicUp);
      window.removeEventListener('touchmove', onMusicMove);
      window.removeEventListener('touchend', onMusicUp);
    };
  }, [musicWinSize.w, musicWinSize.h, musicWinPos.x, musicWinPos.y]);

  // TextEdit app resize and drag handlers
  useEffect(() => {
    function onTextEditMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (textEditDragRef.current.dragging) {
        const newX = clientX - textEditDragRef.current.offsetX;
        const newY = clientY - textEditDragRef.current.offsetY;
        const maxX = window.innerWidth - textEditWinSize.w - 8;
        const maxY = window.innerHeight - textEditWinSize.h - 8;
        setTextEditWinPos({
          x: Math.max(8, Math.min(maxX, newX)),
          y: Math.max(8 + MENU_BAR_HEIGHT, Math.min(maxY, newY)),
        });
      }
      
      if (textEditResizeRef.current.resizing) {
        const dx = clientX - textEditResizeRef.current.startX;
        const dy = clientY - textEditResizeRef.current.startY;
        const minW = 280; const minH = 200; const margin = 8;
        const dir = textEditResizeRef.current.direction;
        const startW = textEditResizeRef.current.startW;
        const startH = textEditResizeRef.current.startH;
        const startLeft = textEditResizeRef.current.startLeft;
        const startTop = textEditResizeRef.current.startTop;

        let nextX = textEditWinPos.x;
        let nextY = textEditWinPos.y;
        let nextW = textEditWinSize.w;
        let nextH = textEditWinSize.h;

        const maxRightW = window.innerWidth - startLeft - margin;
        const maxBottomH = window.innerHeight - startTop - margin;

        if (dir === 'right' || dir === 'tr' || dir === 'br') {
          nextW = Math.max(minW, Math.min(maxRightW, startW + dx));
        }
        if (dir === 'bottom' || dir === 'br' || dir === 'bl') {
          nextH = Math.max(minH, Math.min(maxBottomH, startH + dy));
        }
        if (dir === 'left' || dir === 'tl' || dir === 'bl') {
          const tmpX = startLeft + dx;
          const minXAllowed = margin;
          const maxXAllowed = startLeft + startW - minW;
          nextX = Math.max(minXAllowed, Math.min(maxXAllowed, tmpX));
          nextW = startW + (startLeft - nextX);
        }
        if (dir === 'top' || dir === 'tl' || dir === 'tr') {
          const tmpY = startTop + dy;
          const minYAllowed = margin + MENU_BAR_HEIGHT;
          const maxYAllowed = startTop + startH - minH;
          nextY = Math.max(minYAllowed, Math.min(maxYAllowed, tmpY));
          nextH = startH + (startTop - nextY);
        }

        setTextEditWinPos({ x: nextX, y: nextY });
        setTextEditWinSize({ w: nextW, h: nextH });
      }
    }
    
    function onTextEditUp() {
      textEditDragRef.current.dragging = false;
      textEditResizeRef.current.resizing = false;
    }
    
    window.addEventListener('mousemove', onTextEditMove);
    window.addEventListener('mouseup', onTextEditUp);
    window.addEventListener('touchmove', onTextEditMove, { passive: false });
    window.addEventListener('touchend', onTextEditUp);
    return () => {
      window.removeEventListener('mousemove', onTextEditMove);
      window.removeEventListener('mouseup', onTextEditUp);
      window.removeEventListener('touchmove', onTextEditMove);
      window.removeEventListener('touchend', onTextEditUp);
    };
  }, [textEditWinSize.w, textEditWinSize.h, textEditWinPos.x, textEditWinPos.y]);

  useEffect(() => {
    function onMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      if (dragRef.current.dragging) {
        const newX = clientX - dragRef.current.offsetX;
        const newY = clientY - dragRef.current.offsetY;
        const maxX = window.innerWidth - winSize.w - 8;
        const maxY = window.innerHeight - winSize.h - 8;
        setWinPos({
          x: Math.max(8, Math.min(maxX, newX)),
          y: Math.max(8 + MENU_BAR_HEIGHT, Math.min(maxY, newY)),
        });
      }
      if (resizeRef.current.resizing) {
        const dx = clientX - resizeRef.current.startX;
        const dy = clientY - resizeRef.current.startY;
        const minW = 320; const minH = 220; const margin = 8;
        const dir = resizeRef.current.direction;
        const startW = resizeRef.current.startW;
        const startH = resizeRef.current.startH;
        const startLeft = resizeRef.current.startLeft;
        const startTop = resizeRef.current.startTop;

        let nextX = winPos.x;
        let nextY = winPos.y;
        let nextW = winSize.w;
        let nextH = winSize.h;

        const maxRightW = window.innerWidth - startLeft - margin;
        const maxBottomH = window.innerHeight - startTop - margin;

        if (dir === 'right' || dir === 'tr' || dir === 'br') {
          nextW = Math.max(minW, Math.min(maxRightW, startW + dx));
        }
        if (dir === 'bottom' || dir === 'bl' || dir === 'br') {
          nextH = Math.max(minH, Math.min(maxBottomH, startH + dy));
        }
        if (dir === 'left' || dir === 'tl' || dir === 'bl') {
          const tmpX = startLeft + dx;
          const minXAllowed = margin;
          const maxXAllowed = startLeft + startW - minW;
          nextX = Math.max(minXAllowed, Math.min(maxXAllowed, tmpX));
          nextW = startW + (startLeft - nextX);
        }
        if (dir === 'top' || dir === 'tl' || dir === 'tr') {
          const tmpY = startTop + dy;
          const minYAllowed = MENU_BAR_HEIGHT + margin;
          const maxYAllowed = startTop + startH - minH;
          nextY = Math.max(minYAllowed, Math.min(maxYAllowed, tmpY));
          nextH = startH + (startTop - nextY);
        }

        setWinPos({ x: nextX, y: nextY });
        setWinSize({ w: nextW, h: nextH });
      }
    }
    function onUp() {
      dragRef.current.dragging = false;
      resizeRef.current.resizing = false;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [winSize.w, winSize.h, winPos.x, winPos.y]);

  return (
    <div className="desktop">
      {/* 데스크톱 아이콘들 */}
      <div className="desktop-icons-layer">
        <div className="desktop-icon" style={{ right: 40, top: 100 }}>
          <div className="icon-wrap" onClick={() => { playClickSound(); openWindow('file', 'File'); }}>
            <img src="파일이미지.png" alt="File" width="86" height="86" style={{borderRadius: 14}} />
          </div>
          <div className="label">File</div>
        </div>
        <div className="desktop-icon" style={{ right: 40, top: 200 }}>
          <div className="icon-wrap" onClick={() => { playClickSound(); openWindow('textedit', 'TextEdit'); }}>
            <img src="text.png" alt="TextEdit" width="86" height="86" style={{borderRadius: 14}} />
          </div>
          <div className="label">TextEdit</div>
        </div>
        <div className="desktop-icon" style={{ right: 40, top: 300 }}>
          <div className="icon-wrap" onClick={() => { playClickSound(); openWindow('music', 'Music'); }}>
            <img src="음악 앱.png" alt="Music" width="86" height="86" style={{borderRadius: 14}} />
          </div>
          <div className="label">Music</div>
        </div>
      </div>

      {/* 열린 창들 렌더링 */}
      {windows.map(window => (
        <WindowFrame
          key={window.id}
          id={window.id}
          title={window.title}
          position={window.position}
          size={window.size}
          isMinimized={window.isMinimized}
          isMaximized={window.isMaximized}
          onMove={(position) => moveWindow(window.id, position)}
          onResize={(size) => resizeWindow(window.id, size)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onClose={() => closeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
        >
          {renderApp(window.appType)}
        </WindowFrame>
      ))}
    </div>
  );

}

// 재사용 가능한 WindowFrame 컴포넌트
function WindowFrame({ 
  id, 
  title, 
  position, 
  size, 
  isMinimized, 
  isMaximized,
  onMove, 
  onResize, 
  onMinimize, 
  onMaximize, 
  onClose, 
  onFocus,
  children 
}) {
  const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const resizeRef = useRef({ resizing: false, direction: 'corner', startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 });

  // 드래그 핸들러
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    dragRef.current = { 
      dragging: true, 
      offsetX: e.clientX - rect.left, 
      offsetY: e.clientY - rect.top 
    };
    onFocus(id);
  };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    dragRef.current = { 
      dragging: true, 
      offsetX: t.clientX - rect.left, 
      offsetY: t.clientY - rect.top 
    };
    onFocus(id);
  };

  // 리사이즈 핸들러
  const handleResizeStart = (direction) => (e) => {
    if (e.button !== 0) return;
    resizeRef.current = { 
      resizing: true, 
      direction, 
      startX: e.clientX, 
      startY: e.clientY, 
      startW: size.w, 
      startH: size.h, 
      startLeft: position.x, 
      startTop: position.y 
    };
    e.stopPropagation();
    onFocus(id);
  };

  // 전역 마우스 이벤트
  useEffect(() => {
    function onMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (dragRef.current.dragging) {
        const newX = clientX - dragRef.current.offsetX;
        const newY = clientY - dragRef.current.offsetY;
        const maxX = window.innerWidth - size.w - 8;
        const maxY = window.innerHeight - size.h - 8;
        onMove({
          x: Math.max(8, Math.min(maxX, newX)),
          y: Math.max(8 + MENU_BAR_HEIGHT, Math.min(maxY, newY)),
        });
      }
      
      if (resizeRef.current.resizing) {
        const dx = clientX - resizeRef.current.startX;
        const dy = clientY - resizeRef.current.startY;
        const minW = 280; const minH = 200; const margin = 8;
        const dir = resizeRef.current.direction;
        const startW = resizeRef.current.startW;
        const startH = resizeRef.current.startH;
        const startLeft = resizeRef.current.startLeft;
        const startTop = resizeRef.current.startTop;

        let nextX = position.x;
        let nextY = position.y;
        let nextW = size.w;
        let nextH = size.h;

        const maxRightW = window.innerWidth - startLeft - margin;
        const maxBottomH = window.innerHeight - startTop - margin;

        if (dir === 'right' || dir === 'tr' || dir === 'br') {
          nextW = Math.max(minW, Math.min(maxRightW, startW + dx));
        }
        if (dir === 'bottom' || dir === 'br' || dir === 'bl') {
          nextH = Math.max(minH, Math.min(maxBottomH, startH + dy));
        }
        if (dir === 'left' || dir === 'tl' || dir === 'bl') {
          const tmpX = startLeft + dx;
          const minXAllowed = margin;
          const maxXAllowed = startLeft + startW - minW;
          nextX = Math.max(minXAllowed, Math.min(maxXAllowed, tmpX));
          nextW = startW + (startLeft - nextX);
        }
        if (dir === 'top' || dir === 'tl' || dir === 'tr') {
          const tmpY = startTop + dy;
          const minYAllowed = margin + MENU_BAR_HEIGHT;
          const maxYAllowed = startTop + startH - minH;
          nextY = Math.max(minYAllowed, Math.min(maxYAllowed, tmpY));
          nextH = startH + (startTop - nextY);
        }

        onResize({ w: nextW, h: nextH });
        onMove({ x: nextX, y: nextY });
      }
    }
    
    function onUp() {
      dragRef.current.dragging = false;
      resizeRef.current.resizing = false;
    }
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [size.w, size.h, position.x, position.y, onMove, onResize]);

  return (
    <div
      className="retro-window"
      role="dialog"
      aria-modal="true"
      style={{ 
        top: position.y, 
        left: position.x, 
        width: size.w, 
        height: size.h,
        zIndex: 1000 + id // z-index 관리
      }}
    >
      <div
        className="retro-title-bar"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="traffic" style={{ gap: '10px' }}>
          <button 
            className="btn red" 
            aria-label="Close" 
            onClick={() => onClose(id)} 
          />
          <button 
            className="btn yellow" 
            aria-label="Minimize" 
            onClick={() => onMinimize(id)} 
          />
          <button 
            className="btn green" 
            aria-label="Maximize" 
            onClick={() => onMaximize(id)} 
          />
        </div>
        <div className="retro-title">{title}</div>
      </div>
      
      <div style={{ 
        display: isMinimized ? 'none' : 'block', 
        flex: 1, 
        background: '#f6f6f6',
        height: `calc(100% - 28px)` // 타이틀바 높이 제외
      }}>
        {children}
      </div>
      
      {/* Resize Handles */}
      <div className="resize-handle br" onMouseDown={handleResizeStart('br')} />
      <div className="resize-handle r" onMouseDown={handleResizeStart('right')} />
      <div className="resize-handle b" onMouseDown={handleResizeStart('bottom')} />
      <div className="resize-handle t" onMouseDown={handleResizeStart('top')} />
      <div className="resize-handle l" onMouseDown={handleResizeStart('left')} />
      <div className="resize-handle tl" onMouseDown={handleResizeStart('tl')} />
      <div className="resize-handle tr" onMouseDown={handleResizeStart('tr')} />
      <div className="resize-handle bl" onMouseDown={handleResizeStart('bl')} />
    </div>
  );
}
// 독립적인 앱 컴포넌트들
function FileApp() {
  const [text, setText] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    setTimeout(() => editorRef.current?.focus(), 0);
  }, []);

  return (
    <textarea
      ref={editorRef}
      className="retro-editor"
      placeholder="여기에 메모를 입력하세요..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      style={{ width: '100%', height: '100%', border: 'none', outline: 'none' }}
    />
  );
}
            <div
              className="resize-handle br"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'br', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'br', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle r"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'right', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'right', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle b"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'bottom', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'bottom', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle t"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'top', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'top', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle l"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'left', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'left', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle tl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'tl', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'tl', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle tr"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'tr', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'tr', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
            <div
              className="resize-handle bl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'bl', startX: e.clientX, startY: e.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsMinimized(false);
                resizeRef.current = { resizing: true, direction: 'bl', startX: t.clientX, startY: t.clientY, startW: winSize.w, startH: winSize.h, startLeft: winPos.x, startTop: winPos.y };
              }}
            />
          </div>
        </>
      )}

      {textEditAppOpen && (
        <>
          <div
            className="retro-window"
            role="dialog"
            aria-modal="true"
            style={{ top: textEditWinPos.y, left: textEditWinPos.x, width: textEditWinSize.w, height: textEditWinSize.h }}
          >
            <div
              className="retro-title-bar"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                textEditDragRef.current = { dragging: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                textEditDragRef.current = { dragging: true, offsetX: t.clientX - rect.left, offsetY: t.clientY - rect.top };
              }}
            >
              <div className="traffic" style={{ gap: '10px' }}>
                <button className="btn red" aria-label="Close" onClick={() => { playCloseSound(); setTextEditAppOpen(false); }} />
                <button className="btn yellow" aria-label="Minimize" />
                <button className="btn green" aria-label="Zoom" />
              </div>
              <div className="retro-title">TextEdit</div>
            </div>
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              {/* Toolbar */}
              <div className="textedit-toolbar">
                {/* Format Buttons */}
                <div className="toolbar-group">
                  <button 
                    className={`toolbar-btn ${isBold ? 'active' : ''}`} 
                    title="Bold"
                    onClick={() => setIsBold(!isBold)}
                  >B</button>
                  <button 
                    className={`toolbar-btn ${isItalic ? 'active' : ''}`} 
                    title="Italic" 
                    style={{fontStyle: 'italic'}}
                    onClick={() => setIsItalic(!isItalic)}
                  >I</button>
                  <button 
                    className={`toolbar-btn ${isUnderline ? 'active' : ''}`} 
                    title="Underline" 
                    style={{textDecoration: 'underline'}}
                    onClick={() => setIsUnderline(!isUnderline)}
                  >U</button>
                </div>
                
                {/* Font Size Dropdown */}
                <div className="toolbar-group">
                  <select 
                    className="toolbar-dropdown"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                  >
                    <option value="13">Text</option>
                    <option value="19">Heading1</option>
                    <option value="25">Heading2</option>
                    <option value="31">Heading3</option>
                  </select>
                </div>
                
                {/* Text Alignment */}
                <div className="toolbar-group">
                  <button 
                    className={`toolbar-btn ${textAlign === 'left' ? 'active' : ''}`} 
                    title="Align Left"
                    onClick={() => setTextAlign('left')}
                  >☰</button>
                  <button 
                    className={`toolbar-btn ${textAlign === 'center' ? 'active' : ''}`} 
                    title="Align Center"
                    onClick={() => setTextAlign('center')}
                  >☰</button>
                  <button 
                    className={`toolbar-btn ${textAlign === 'right' ? 'active' : ''}`} 
                    title="Align Right"
                    onClick={() => setTextAlign('right')}
                  >☰</button>
                </div>
                
                {/* Lists */}
                <div className="toolbar-group">
                  <button 
                    className="toolbar-btn" 
                    title="Unordered List" 
                    style={{fontSize: '16px', lineHeight: '1'}}
                    onClick={() => insertList('ul')}
                  >•</button>
                  <button 
                    className="toolbar-btn" 
                    title="Ordered List" 
                    style={{fontSize: '10px'}}
                    onClick={() => insertList('ol')}
                  >1.</button>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="textedit-content">
                <textarea
                  ref={textEditEditorRef}
                  className="retro-editor"
                  placeholder=""
                  value={textEditText}
                  onChange={(e) => setTextEditText(e.target.value)}
                  style={{
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    fontSize: `${fontSize}px`,
                    textAlign: textAlign
                  }}
                />
              </div>
            </div>
            
            {/* Resize Handles */}
            <div
              className="resize-handle br"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'br', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle r"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'right', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle b"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'bottom', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle t"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'top', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle l"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'left', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle tl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'tl', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle tr"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'tr', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
            <div
              className="resize-handle bl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                textEditResizeRef.current = { resizing: true, direction: 'bl', startX: e.clientX, startY: e.clientY, startW: textEditWinSize.w, startH: textEditWinSize.h, startLeft: textEditWinPos.x, startTop: textEditWinPos.y };
                e.stopPropagation();
              }}
            />
          </div>
        </>
      )}

      {musicAppOpen && (
        <>
          <div
            className="retro-window"
            role="dialog"
            aria-modal="true"
            style={{ top: musicWinPos.y, left: musicWinPos.x, width: musicWinSize.w, height: musicWinSize.h }}
          >
            <div
              className="retro-title-bar"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                musicDragRef.current = { dragging: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                musicDragRef.current = { dragging: true, offsetX: t.clientX - rect.left, offsetY: t.clientY - rect.top };
              }}
            >
              <div className="traffic" style={{ gap: '10px' }}>
                <button className="btn red" aria-label="Close" onClick={() => { playCloseSound(); setMusicAppOpen(false); }} />
                <button className="btn yellow" aria-label="Minimize" />
                <button
                  className="btn green"
                  aria-label="Zoom"
                  onClick={() => {
                    if (!isZoomed) {
                      setMusicWinSize({ w: 600, h: 800 });
                      setIsZoomed(true);
                    } else {
                      setMusicWinSize({ w: 450, h: 650 });
                      setIsZoomed(false);
                    }
                  }}
                />
              </div>
              <div className="retro-title">Music</div>
            </div>
            <div style={{ display: 'block', flex: 1, background: '#1a1a1a', padding: '20px', color: 'white' }}>
              <MusicPlayer 
                playlist={initialPlaylist}
                currentTrackIndex={currentTrackIndex}
                setCurrentTrackIndex={setCurrentTrackIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={progress}
                setProgress={setProgress}
                windowSize={musicWinSize}
              />
            </div>
            
            {/* Resize Handles */}
            <div
              className="resize-handle br"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                musicResizeRef.current = { resizing: true, direction: 'br', startX: e.clientX, startY: e.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                musicResizeRef.current = { resizing: true, direction: 'br', startX: t.clientX, startY: t.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
              }}
            />
            <div
              className="resize-handle r"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                musicResizeRef.current = { resizing: true, direction: 'right', startX: e.clientX, startY: e.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                musicResizeRef.current = { resizing: true, direction: 'right', startX: t.clientX, startY: t.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
              }}
            />
            <div
              className="resize-handle l"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                musicResizeRef.current = { resizing: true, direction: 'left', startX: e.clientX, startY: e.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                musicResizeRef.current = { resizing: true, direction: 'left', startX: t.clientX, startY: t.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
              }}
            />
            <div
              className="resize-handle tl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                musicResizeRef.current = { resizing: true, direction: 'tl', startX: e.clientX, startY: e.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                musicResizeRef.current = { resizing: true, direction: 'tl', startX: t.clientX, startY: t.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
              }}
            />
            <div
              className="resize-handle tr"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                musicResizeRef.current = { resizing: true, direction: 'tr', startX: e.clientX, startY: e.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                musicResizeRef.current = { resizing: true, direction: 'tr', startX: t.clientX, startY: t.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
              }}
            />
            <div
              className="resize-handle bl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                musicResizeRef.current = { resizing: true, direction: 'bl', startX: e.clientX, startY: e.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                musicResizeRef.current = { resizing: true, direction: 'bl', startX: t.clientX, startY: t.clientY, startW: musicWinSize.w, startH: musicWinSize.h, startLeft: musicWinPos.x, startTop: musicWinPos.y };
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// 재사용 가능한 WindowFrame 컴포넌트
function WindowFrame({ 
  id, 
  title, 
  position, 
  size, 
  isMinimized, 
  isMaximized,
  onMove, 
  onResize, 
  onMinimize, 
  onMaximize, 
  onClose, 
  onFocus,
  children 
}) {
  const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const resizeRef = useRef({ resizing: false, direction: 'corner', startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0 });

  // 드래그 핸들러
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    dragRef.current = { 
      dragging: true, 
      offsetX: e.clientX - rect.left, 
      offsetY: e.clientY - rect.top 
    };
    onFocus(id);
  };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    dragRef.current = { 
      dragging: true, 
      offsetX: t.clientX - rect.left, 
      offsetY: t.clientY - rect.top 
    };
    onFocus(id);
  };

  // 리사이즈 핸들러
  const handleResizeStart = (direction) => (e) => {
    if (e.button !== 0) return;
    resizeRef.current = { 
      resizing: true, 
      direction, 
      startX: e.clientX, 
      startY: e.clientY, 
      startW: size.w, 
      startH: size.h, 
      startLeft: position.x, 
      startTop: position.y 
    };
    e.stopPropagation();
    onFocus(id);
  };

  // 전역 마우스 이벤트
  useEffect(() => {
    function onMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      if (dragRef.current.dragging) {
        const newX = clientX - dragRef.current.offsetX;
        const newY = clientY - dragRef.current.offsetY;
        const maxX = window.innerWidth - size.w - 8;
        const maxY = window.innerHeight - size.h - 8;
        onMove({
          x: Math.max(8, Math.min(maxX, newX)),
          y: Math.max(8 + MENU_BAR_HEIGHT, Math.min(maxY, newY)),
        });
      }
      
      if (resizeRef.current.resizing) {
        const dx = clientX - resizeRef.current.startX;
        const dy = clientY - resizeRef.current.startY;
        const minW = 280; const minH = 200; const margin = 8;
        const dir = resizeRef.current.direction;
        const startW = resizeRef.current.startW;
        const startH = resizeRef.current.startH;
        const startLeft = resizeRef.current.startLeft;
        const startTop = resizeRef.current.startTop;

        let nextX = position.x;
        let nextY = position.y;
        let nextW = size.w;
        let nextH = size.h;

        const maxRightW = window.innerWidth - startLeft - margin;
        const maxBottomH = window.innerHeight - startTop - margin;

        if (dir === 'right' || dir === 'tr' || dir === 'br') {
          nextW = Math.max(minW, Math.min(maxRightW, startW + dx));
        }
        if (dir === 'bottom' || dir === 'br' || dir === 'bl') {
          nextH = Math.max(minH, Math.min(maxBottomH, startH + dy));
        }
        if (dir === 'left' || dir === 'tl' || dir === 'bl') {
          const tmpX = startLeft + dx;
          const minXAllowed = margin;
          const maxXAllowed = startLeft + startW - minW;
          nextX = Math.max(minXAllowed, Math.min(maxXAllowed, tmpX));
          nextW = startW + (startLeft - nextX);
        }
        if (dir === 'top' || dir === 'tl' || dir === 'tr') {
          const tmpY = startTop + dy;
          const minYAllowed = margin + MENU_BAR_HEIGHT;
          const maxYAllowed = startTop + startH - minH;
          nextY = Math.max(minYAllowed, Math.min(maxYAllowed, tmpY));
          nextH = startH + (startTop - nextY);
        }

        onResize({ w: nextW, h: nextH });
        onMove({ x: nextX, y: nextY });
      }
    }
    
    function onUp() {
      dragRef.current.dragging = false;
      resizeRef.current.resizing = false;
    }
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [size.w, size.h, position.x, position.y, onMove, onResize]);

  return (
    <div
      className="retro-window"
      role="dialog"
      aria-modal="true"
      style={{ 
        top: position.y, 
        left: position.x, 
        width: size.w, 
        height: size.h,
        zIndex: 1000 + id // z-index 관리
      }}
    >
      <div
        className="retro-title-bar"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="traffic" style={{ gap: '10px' }}>
          <button 
            className="btn red" 
            aria-label="Close" 
            onClick={() => onClose(id)} 
          />
          <button 
            className="btn yellow" 
            aria-label="Minimize" 
            onClick={() => onMinimize(id)} 
          />
          <button 
            className="btn green" 
            aria-label="Maximize" 
            onClick={() => onMaximize(id)} 
          />
        </div>
        <div className="retro-title">{title}</div>
      </div>
      
      <div style={{ 
        display: isMinimized ? 'none' : 'block', 
        flex: 1, 
        background: '#f6f6f6',
        height: `calc(100% - 28px)` // 타이틀바 높이 제외
      }}>
        {children}
      </div>
      
      {/* Resize Handles */}
      <div className="resize-handle br" onMouseDown={handleResizeStart('br')} />
      <div className="resize-handle r" onMouseDown={handleResizeStart('right')} />
      <div className="resize-handle b" onMouseDown={handleResizeStart('bottom')} />
      <div className="resize-handle t" onMouseDown={handleResizeStart('top')} />
      <div className="resize-handle l" onMouseDown={handleResizeStart('left')} />
      <div className="resize-handle tl" onMouseDown={handleResizeStart('tl')} />
      <div className="resize-handle tr" onMouseDown={handleResizeStart('tr')} />
      <div className="resize-handle bl" onMouseDown={handleResizeStart('bl')} />
    </div>
  );
}

// 독립적인 앱 컴포넌트들
function FileApp() {
  const [text, setText] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    setTimeout(() => editorRef.current?.focus(), 0);
  }, []);

  return (
    <textarea
      ref={editorRef}
      className="retro-editor"
      placeholder="여기에 메모를 입력하세요..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      style={{ width: '100%', height: '100%', border: 'none', outline: 'none' }}
    />
  );
}

function TextEditApp() {
  const [text, setText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [textAlign, setTextAlign] = useState('left');
  const editorRef = useRef(null);

  useEffect(() => {
    setTimeout(() => editorRef.current?.focus(), 0);
  }, []);

  const insertList = (type) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let newText;
    if (type === 'ul') {
      newText = selectedText.split('\n').map(line => line.trim() ? `• ${line}` : line).join('\n');
    } else {
      newText = selectedText.split('\n').map((line, index) => line.trim() ? `${index + 1}. ${line}` : line).join('\n');
    }
    
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);
    setText(beforeText + newText + afterText);
    
    setTimeout(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + newText.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="textedit-toolbar">
        {/* Format Buttons */}
        <div className="toolbar-group">
          <button 
            className={`toolbar-btn ${isBold ? 'active' : ''}`} 
            title="Bold"
            onClick={() => setIsBold(!isBold)}
          >B</button>
          <button 
            className={`toolbar-btn ${isItalic ? 'active' : ''}`} 
            title="Italic" 
            style={{fontStyle: 'italic'}}
            onClick={() => setIsItalic(!isItalic)}
          >I</button>
          <button 
            className={`toolbar-btn ${isUnderline ? 'active' : ''}`} 
            title="Underline" 
            style={{textDecoration: 'underline'}}
            onClick={() => setIsUnderline(!isUnderline)}
          >U</button>
        </div>
        
        {/* Font Size Dropdown */}
        <div className="toolbar-group">
          <select 
            className="toolbar-dropdown"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          >
            <option value="13">Text</option>
            <option value="19">Heading1</option>
            <option value="25">Heading2</option>
            <option value="31">Heading3</option>
          </select>
        </div>
        
        {/* Text Alignment */}
        <div className="toolbar-group">
          <button 
            className={`toolbar-btn ${textAlign === 'left' ? 'active' : ''}`} 
            title="Align Left"
            onClick={() => setTextAlign('left')}
          >☰</button>
          <button 
            className={`toolbar-btn ${textAlign === 'center' ? 'active' : ''}`} 
            title="Align Center"
            onClick={() => setTextAlign('center')}
          >☰</button>
          <button 
            className={`toolbar-btn ${textAlign === 'right' ? 'active' : ''}`} 
            title="Align Right"
            onClick={() => setTextAlign('right')}
          >☰</button>
        </div>
        
        {/* Lists */}
        <div className="toolbar-group">
          <button 
            className="toolbar-btn" 
            title="Unordered List" 
            style={{fontSize: '16px', lineHeight: '1'}}
            onClick={() => insertList('ul')}
          >•</button>
          <button 
            className="toolbar-btn" 
            title="Ordered List" 
            style={{fontSize: '10px'}}
            onClick={() => insertList('ol')}
          >1.</button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="textedit-content">
        <textarea
          ref={editorRef}
          className="retro-editor"
          placeholder=""
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            fontSize: `${fontSize}px`,
            textAlign: textAlign,
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}

function MusicApp() {
  const [playlist] = useState([
    { videoId: 'SIuF37EWaLU', title: '東京フラッシュ', artist: 'Vaundy' },
    { videoId: '1FIhcdocT-k', title: '恋風邪にのせて', artist: 'Vaundy' },
    { videoId: 'XYepTo2hnBQ', title: 'Famous', artist: 'ALLDAY PROJECT' },
    { videoId: 'bNKXxwOQYB8', title: 'EASY', artist: 'LE SSERAFIM (르세라핌)' },
    { videoId: 's984zMNLL2o', title: 'シャッター', artist: '優里' }
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);

  const currentTrack = playlist[currentTrackIndex];

  // YouTube player event handlers
  const onReady = (event) => {
    console.log('YouTube player ready');
    playerRef.current = event.target;
    try {
      const initialDuration = event.target.getDuration();
      if (initialDuration > 0) {
        setDuration(initialDuration);
      }
    } catch (error) {
      console.log('Could not get initial duration:', error);
    }
    
    if (isPlaying) {
      setTimeout(() => {
        try {
          event.target.playVideo();
        } catch (error) {
          console.log('Auto play failed:', error);
        }
      }, 100);
    }
  };
  
  const onStateChange = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false);
    }
  };

  // YouTube IFrame API 로드
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const onYouTubeIframeAPIReady = () => {
      if (window.YT && window.YT.Player) {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        
        const player = new window.YT.Player(`youtube-player-${currentTrack.videoId}`, {
          events: {
            'onReady': onReady,
            'onStateChange': onStateChange
          }
        });
        playerRef.current = player;
      }
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentTrack.videoId]);

  // 진행률 업데이트
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const currentDuration = playerRef.current.getDuration();
          
          if (currentDuration > 0 && currentTime >= 0) {
            setCurrentTime(currentTime);
            setDuration(currentDuration);
            const newProgress = (currentTime / currentDuration) * 100;
            setProgress(newProgress);
          }
        } catch (error) {
          console.log('YouTube player not ready yet:', error);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  const handlePrev = () => {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };
  
  const handleNext = () => {
    const newIndex = currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };
  
  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTrackSelect = (index) => {
    if (index === currentTrackIndex) return;
    setCurrentTrackIndex(index);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (e) => {
    if (playerRef.current && playerRef.current.seekTo && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekPercent = clickX / width;
      const newTime = seekPercent * duration;
      
      try {
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
        setProgress(seekPercent * 100);
      } catch (error) {
        console.log('Seek failed:', error);
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1a1a1a', color: 'white', padding: '20px' }}>
      {/* YouTube Player */}
      <div style={{ 
        width: '100%', 
        height: '150px', 
        marginBottom: '20px', 
        borderRadius: '8px', 
        overflow: 'hidden'
      }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=0&controls=1&enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1&fs=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          id={`youtube-player-${currentTrack.videoId}`}
        />
      </div>
      
      {/* Track Info */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{currentTrack.title}</h3>
        <p style={{ margin: '0', fontSize: '12px', color: '#b3b3b3' }}>{currentTrack.artist}</p>
      </div>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div 
          style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: '#333', 
            borderRadius: '3px',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={handleSeek}
        >
          <div 
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#1db954', 
              borderRadius: '3px',
              transition: 'width 0.1s ease',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-1px',
              width: '8px',
              height: '8px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              border: '2px solid #1db954',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)'
            }} />
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '11px', 
          color: '#b3b3b3', 
          marginTop: '8px'
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '20px'
      }}>
        <button 
          onClick={handlePrev}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '20px', 
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          ⏮
        </button>
        <button 
          onClick={handlePlayPause}
          style={{ 
            background: '#1db954', 
            border: 'none', 
            color: 'white', 
            fontSize: '28px', 
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          onClick={handleNext}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '20px', 
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          ⏭
        </button>
      </div>
      
      {/* Playlist */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Playlist</h4>
        <div style={{ height: '120px', overflowY: 'auto' }} className="custom-scrollbar">
          {playlist.map((track, index) => (
            <div key={track.videoId}>
              <div 
                onClick={() => handleTrackSelect(index)}
                style={{ 
                  padding: '12px', 
                  backgroundColor: index === currentTrackIndex ? '#333' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  border: index === currentTrackIndex ? '1px solid #1db954' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{track.title}</div>
                <div style={{ fontSize: '10px', color: '#b3b3b3' }}>{track.artist}</div>
              </div>
              <div style={{
                height: '1px',
                backgroundColor: '#444',
                margin: '0 8px',
                opacity: 0.6
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RetroWindowPlaceholder() { return null; }

function MusicPlayer({ playlist, currentTrackIndex, setCurrentTrackIndex, isPlaying, setIsPlaying, progress, setProgress, windowSize }) {
  const currentTrack = playlist[currentTrackIndex];
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // YouTube player event handlers
  const onReady = (event) => {
    console.log('YouTube player ready');
    playerRef.current = event.target;
    // 초기 duration 설정
    try {
      const initialDuration = event.target.getDuration();
      if (initialDuration > 0) {
        setDuration(initialDuration);
        console.log('Initial duration:', initialDuration);
      }
    } catch (error) {
      console.log('Could not get initial duration:', error);
    }
    
    // 자동 재생 (isPlaying이 true일 때)
    if (isPlaying) {
      setTimeout(() => {
        try {
          event.target.playVideo();
        } catch (error) {
          console.log('Auto play failed:', error);
        }
      }, 100);
    }
  };
  
  const onStateChange = (event) => {
    console.log('YouTube player state changed:', event.data);
    // YouTube player state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) {
      setIsPlaying(false);
    }
  };
  
  // YouTube IFrame API 로드 및 이벤트 연결
  useEffect(() => {
    // YouTube IFrame API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // YouTube API 준비되면 플레이어 생성
    const onYouTubeIframeAPIReady = () => {
      if (window.YT && window.YT.Player) {
        // 기존 플레이어가 있으면 제거
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        
        const player = new window.YT.Player(`youtube-player-${currentTrack.videoId}`, {
          events: {
            'onReady': onReady,
            'onStateChange': onStateChange
          }
        });
        playerRef.current = player;
      }
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentTrack.videoId]);

  // 실시간 진행률 업데이트 (0.5초마다)
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const currentDuration = playerRef.current.getDuration();
          
          if (currentDuration > 0 && currentTime >= 0) {
            setCurrentTime(currentTime);
            setDuration(currentDuration);
            const newProgress = (currentTime / currentDuration) * 100;
            setProgress(newProgress);
          }
        } catch (error) {
          console.log('YouTube player not ready yet:', error);
        }
      }, 500); // 0.5초마다 업데이트
    }
    return () => clearInterval(interval);
  }, [isPlaying, setProgress]);
  
  const handlePrev = () => {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true); // 자동 재생
  };
  
  const handleNext = () => {
    const newIndex = currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0;
    setCurrentTrackIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true); // 자동 재생
  };
  
  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTrackSelect = (index) => {
    if (index === currentTrackIndex) return; // 같은 곡이면 무시
    
    setCurrentTrackIndex(index);
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };
  
  // 시간을 MM:SS 형식으로 변환하는 함수
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (e) => {
    if (playerRef.current && playerRef.current.seekTo && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekPercent = clickX / width;
      const newTime = seekPercent * duration;
      
      try {
        console.log('Seeking to:', newTime, 'seconds');
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
        setProgress(seekPercent * 100);
      } catch (error) {
        console.log('Seek failed:', error);
      }
    } else {
      console.log('Player not ready for seek');
    }
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* YouTube Player */}
      <div style={{ 
        width: '100%', 
        height: Math.min(200, windowSize.h * 0.3), 
        marginBottom: '20px', 
        borderRadius: '8px', 
        overflow: 'hidden',
        minHeight: '150px'
      }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=0&controls=1&enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1&fs=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          id={`youtube-player-${currentTrack.videoId}`}
        />
      </div>
      
      {/* Track Info */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: Math.max(20, windowSize.h * 0.03),
        padding: '0 10px'
      }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: Math.max(16, windowSize.w * 0.04), 
          fontWeight: '600',
          lineHeight: '1.2'
        }}>{currentTrack.title}</h3>
        <p style={{ 
          margin: '0', 
          fontSize: Math.max(12, windowSize.w * 0.03), 
          color: '#b3b3b3',
          lineHeight: '1.2'
        }}>{currentTrack.artist}</p>
      </div>
      
      {/* Progress Bar */}
      <div style={{ 
        marginBottom: Math.max(20, windowSize.h * 0.03),
        padding: '0 10px'
      }}>
        <div 
          style={{ 
            width: '100%', 
            height: Math.max(6, windowSize.h * 0.008), 
            backgroundColor: '#333', 
            borderRadius: '3px',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={handleSeek}
        >
          <div 
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#1db954', 
              borderRadius: '3px',
              transition: 'width 0.1s ease',
              position: 'relative'
            }}
          >
            {/* Progress indicator dot */}
            <div style={{
              position: 'absolute',
              right: '-4px',
              top: '-1px',
              width: '8px',
              height: '8px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              border: '2px solid #1db954',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)'
            }} />
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: Math.max(11, windowSize.w * 0.028), 
          color: '#b3b3b3', 
          marginTop: '8px',
          fontWeight: '500'
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: Math.max(20, windowSize.w * 0.05), 
        marginBottom: Math.max(20, windowSize.h * 0.03),
        padding: '0 10px'
      }}>
        <button 
          onClick={handlePrev}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: Math.max(20, windowSize.w * 0.05), 
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          ⏮
        </button>
        <button 
          onClick={handlePlayPause}
          style={{ 
            background: '#1db954', 
            border: 'none', 
            color: 'white', 
            fontSize: Math.max(28, windowSize.w * 0.07), 
            cursor: 'pointer',
            padding: Math.max(12, windowSize.w * 0.03),
            borderRadius: '50%',
            width: Math.max(60, windowSize.w * 0.15),
            height: Math.max(60, windowSize.w * 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          onClick={handleNext}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: Math.max(20, windowSize.w * 0.05), 
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          ⏭
        </button>
      </div>
      
      {/* Playlist */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        padding: '0 10px'
      }}>
        {/* Playlist Header - Fixed */}
        <h4 style={{ 
          margin: '0 0 16px 0', 
          fontSize: Math.max(14, windowSize.w * 0.035), 
          fontWeight: '600',
          padding: '8px 0',
          flexShrink: 0
        }}>Playlist</h4>
        
        {/* Playlist Tracks - Scrollable Container */}
        <div style={{ 
          height: '160px',
          overflowY: 'auto',
          paddingBottom: '20px'
        }} className="custom-scrollbar">
          {playlist.map((track, index) => (
            <div key={track.videoId}>
              <div 
                onClick={() => handleTrackSelect(index)}
                style={{ 
                  padding: Math.max(12, windowSize.h * 0.02), 
                  backgroundColor: index === currentTrackIndex ? '#333' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: Math.max(8, windowSize.h * 0.015),
                  border: index === currentTrackIndex ? '1px solid #1db954' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  fontSize: Math.max(12, windowSize.w * 0.03), 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  lineHeight: '1.2'
                }}>{track.title}</div>
                <div style={{ 
                  fontSize: Math.max(10, windowSize.w * 0.025), 
                  color: '#b3b3b3',
                  lineHeight: '1.2'
                }}>{track.artist}</div>
              </div>
              {/* 구분선 - 모든 아이템 아래에 표시 */}
              <div style={{
                height: '1px',
                backgroundColor: '#444',
                margin: '0 8px',
                opacity: 0.6
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



