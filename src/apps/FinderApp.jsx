import React, { useState } from 'react';
import styles from './FinderApp.module.css';

function FinderApp({ onOpenApp }) {
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [history, setHistory] = useState(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);

  const directoryContents = {
    '/': [
      { name: 'Applications', type: 'folder', path: '/Applications' },
      { name: 'Documents', type: 'folder', path: '/Documents' },
      { name: 'Images', type: 'folder', path: '/Images' },
      { name: 'Music', type: 'folder', path: '/Music' }
    ],
    '/Applications': [
      { name: 'TextEdit', type: 'app', icon: 'text.png', appType: 'Notepad' },
      { name: 'Music', type: 'app', icon: '음악 앱.png', appType: 'Music' },
      { name: 'Album', type: 'app', icon: '앨범 앱.png', appType: 'Album' },
      { name: 'Chats', type: 'app', icon: '맥 chat.png', appType: 'Chats' },
      { name: 'Photo Booth', type: 'app', icon: '포토부스.png', appType: 'PhotoBooth' },
      { name: 'Dino Game', type: 'app', icon: '공룡게임.svg', appType: 'DinoGame' }
    ],
    '/Documents': [
      { name: 'My Documents', type: 'folder', path: '/Documents/My Documents' },
      { name: 'Projects', type: 'folder', path: '/Documents/Projects' }
    ],
    '/Images': [
      { name: 'Photos', type: 'folder', path: '/Images/Photos' },
      { name: 'Screenshots', type: 'folder', path: '/Images/Screenshots' }
    ],
    '/Music': [
      { name: 'Playlists', type: 'folder', path: '/Music/Playlists' },
      { name: 'Downloads', type: 'folder', path: '/Music/Downloads' }
    ]
  };

  const navigateToDirectory = (path) => {
    if (path === currentDirectory) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentDirectory(path);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentDirectory(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentDirectory(history[newIndex]);
    }
  };

  const handleItemClick = (item, event) => {
    // 단일 클릭 시 선택 상태만 변경
    if (event.detail === 1) {
      setSelectedItems([item.name]);
    }
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'folder') {
      navigateToDirectory(item.path);
      setSelectedItems([]); // 폴더 이동 시 선택 해제
    } else if (item.type === 'app' && onOpenApp) {
      onOpenApp(item.appType);
      setSelectedItems([]); // 앱 실행 시 선택 해제
    }
  };

  const currentFiles = directoryContents[currentDirectory] || [];

  return (
    <div className={styles.finder}>
      <div className={styles.toolbar}>
        <div className={styles.navigationButtons}>
          <button 
            className={styles.navButton} 
            onClick={goBack}
            disabled={historyIndex === 0}
            title="뒤로가기"
          >
            ←
          </button>
          <button 
            className={styles.navButton} 
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            title="앞으로가기"
          >
            →
          </button>
        </div>
        <div className={styles.pathBar}>{currentDirectory}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.fileList}>
          {currentFiles.map((file, index) => (
            <div 
              key={index} 
              className={`${styles.fileItem} ${selectedItems.includes(file.name) ? styles.selected : ''}`}
              onClick={(e) => handleItemClick(file, e)}
              onDoubleClick={() => handleItemDoubleClick(file)}
            >
              <div className={styles.fileIcon}>
                {file.type === 'folder' ? '📁' : 
                 file.type === 'app' ? (
                  <img 
                    src={`/icon/${file.icon}`} 
                    alt={file.name}
                    className={styles.appIcon}
                  />
                 ) : '📄'}
              </div>
              <div className={styles.fileName}>{file.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinderApp;


