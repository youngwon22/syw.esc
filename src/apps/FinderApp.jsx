import React, { useState, useEffect } from 'react';
import styles from './FinderApp.module.css';
import fileSystem from '../core/FileSystem';

function FinderApp({ onOpenApp, initialPath }) {
  const startPath = initialPath || '/';
  const [currentDirectory, setCurrentDirectory] = useState(startPath);
  const [history, setHistory] = useState([startPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [pathInput, setPathInput] = useState(startPath);

  // 현재 디렉토리의 파일 목록 가져오기
  useEffect(() => {
    try {
      const fileList = fileSystem.list(currentDirectory);
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to list directory:', error);
      setFiles([]);
    }
  }, [currentDirectory]);

  const navigateToDirectory = (path) => {
    if (path === currentDirectory) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentDirectory(path);
    setPathInput(path);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentDirectory(history[newIndex]);
      setPathInput(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentDirectory(history[newIndex]);
      setPathInput(history[newIndex]);
    }
  };

  const handlePathSubmit = (e) => {
    e.preventDefault();
    const path = pathInput.trim() || '/';

    // 경로가 존재하는지 확인
    try {
      const node = fileSystem.getNode(path);
      if (node && node.type === 'folder') {
        navigateToDirectory(path);
      } else {
        // 잘못된 경로면 현재 경로로 되돌림
        setPathInput(currentDirectory);
      }
    } catch {
      setPathInput(currentDirectory);
    }
  };

  const handleItemClick = (item, event) => {
    // 단일 클릭 시 선택 상태만 변경
    if (event.detail === 1) {
      setSelectedItems([item.name]);
    }
  };

  const handleItemDoubleClick = (item) => {
    try {
      const opened = fileSystem.open(item.path);
      
      if (opened.type === 'folder') {
        navigateToDirectory(item.path);
        setSelectedItems([]);
      } else if (opened.type === 'app' && onOpenApp) {
        onOpenApp(opened.appType);
        setSelectedItems([]);
      } else if (opened.type === 'file' && onOpenApp) {
        // 파일을 적절한 앱으로 열기
        onOpenApp(opened.appType);
        // 파일 경로를 전역 상태나 이벤트로 전달할 수 있음
        window.dispatchEvent(new CustomEvent('openFile', { 
          detail: { path: opened.path, content: opened.content }
        }));
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Failed to open item:', error);
    }
  };

  // 알파벳 순으로 정렬
  const getSortedFiles = (files) => {
    return [...files].sort((a, b) => {
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });
  };

  const currentFiles = getSortedFiles(files);

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
        <form onSubmit={handlePathSubmit} className={styles.pathForm}>
          <input
            type="text"
            className={styles.pathBar}
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onBlur={() => setPathInput(currentDirectory)}
          />
        </form>
      </div>
      <div className={styles.content}>
        <div className={styles.fileList}>
          {currentFiles.map((file, index) => (
            <div 
              key={index} 
              className={styles.fileItem}
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(file, e);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                handleItemDoubleClick(file);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className={styles.fileIcon}>
                {file.type === 'folder' ? '📁' : 
                 file.type === 'app' ? (
                  <img 
                    src={`/icon/${file.meta?.icon || '파일이미지.png'}`} 
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


