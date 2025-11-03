import React, { useState, useRef, useEffect } from 'react';
import styles from './TextEditApp.module.css';

function TextEditApp() {
  const [fontSize, setFontSize] = useState('Text');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef(null);

  // 초기 블록 생성
  useEffect(() => {
    if (editorRef.current && editorRef.current.children.length === 0) {
      const initialBlock = document.createElement('div');
      initialBlock.style.fontSize = '14px';
      initialBlock.innerHTML = '<br>';
      editorRef.current.appendChild(initialBlock);
      
      // 커서를 초기 블록으로 이동
      const range = document.createRange();
      range.setStart(initialBlock, 0);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // 텍스트 선택 시 버튼 상태 업데이트
  const updateButtonStates = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    
    // 현재 블록의 폰트 사이즈 확인하여 드롭다운 업데이트
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      
      let blockElement = null;
      let currentElement = node;
      
      while (currentElement && currentElement !== editorRef.current) {
        if (currentElement.parentElement === editorRef.current && currentElement.tagName === 'DIV') {
          blockElement = currentElement;
          break;
        }
        currentElement = currentElement.parentElement;
      }
      
      if (blockElement && blockElement !== editorRef.current) {
        const fontSize = window.getComputedStyle(blockElement).fontSize;
        const sizeMap = {
          '14px': 'Text',
          '18px': 'Heading 3',
          '22px': 'Heading 2',
          '26px': 'Heading 1'
        };
        
        if (sizeMap[fontSize]) {
          setFontSize(sizeMap[fontSize]);
        }
      }
    }
  };

  // Bold 토글 함수
  const toggleBold = () => {
    document.execCommand('bold');
    // 현재 선택 영역의 bold 상태 확인
    const isBoldActive = document.queryCommandState('bold');
    setIsBold(isBoldActive);
    editorRef.current.focus();
  };

  // Italic 토글 함수
  const toggleItalic = () => {
    document.execCommand('italic');
    // 현재 선택 영역의 italic 상태 확인
    const isItalicActive = document.queryCommandState('italic');
    setIsItalic(isItalicActive);
    editorRef.current.focus();
  };

  // Underline 토글 함수
  const toggleUnderline = () => {
    document.execCommand('underline');
    // 현재 선택 영역의 underline 상태 확인
    const isUnderlineActive = document.queryCommandState('underline');
    setIsUnderline(isUnderlineActive);
    editorRef.current.focus();
  };

  // 글자 크기 변경 함수
  const setFontSizeCommand = (size) => {
    const sizeMap = {
      'Text': '14px',
      'Heading 3': '18px',
      'Heading 2': '22px',
      'Heading 1': '26px'
    };
    
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      setFontSize(size);
      setShowDropdown(false);
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // 선택된 텍스트가 있는 경우
    if (!range.collapsed) {
      // 선택된 범위를 span으로 감싸서 폰트 크기 적용
      const span = document.createElement('span');
      span.style.fontSize = sizeMap[size];
      span.style.display = 'inline';
      try {
        range.surroundContents(span);
      } catch (e) {
        // 이미 감싸져 있는 경우 범위를 확장하여 처리
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
    } else {
      // 커서만 있는 경우 - 현재 위치의 블록 찾기
      // 현재 커서 위치 저장
      const currentOffset = range.startOffset;
      const currentContainer = range.startContainer;
      
      // 커서에서 가장 가까운 블록 요소 찾기
      let node = range.startContainer;
      
      // 텍스트 노드면 부모 요소 사용
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      
      // editorRef.current의 직계 자식 div 블록 찾기
      let blockElement = null;
      let currentElement = node;
      
      // 최상단까지 탐색하며 editor의 직계 자식 div를 찾음
      while (currentElement && currentElement !== editorRef.current) {
        if (currentElement.parentElement === editorRef.current && currentElement.tagName === 'DIV') {
          blockElement = currentElement;
          break;
        }
        currentElement = currentElement.parentElement;
      }
      
      // 블록 요소가 있는 경우 해당 블록의 크기 변경
      if (blockElement && blockElement !== editorRef.current) {
        const currentOffset = range.startOffset;
        const currentContainer = range.startContainer;
        
        // 블록의 폰트 크기 변경
        blockElement.style.fontSize = sizeMap[size];
        
        // 커서 위치 복원
        setTimeout(() => {
          const newRange = document.createRange();
          if (currentContainer.nodeType === Node.TEXT_NODE) {
            newRange.setStart(currentContainer, Math.min(currentOffset, currentContainer.textContent.length));
          } else {
            const textNode = blockElement.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              newRange.setStart(textNode, Math.min(currentOffset, textNode.textContent.length));
            } else {
              newRange.setStart(blockElement, 0);
            }
          }
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }, 0);
      }
      // 블록 요소가 없거나 editor 자체인 경우
      else if (!blockElement || blockElement === editorRef.current) {
        // editor가 비어있으면 첫 번째 블록 생성
        if (editorRef.current.children.length === 0) {
          const firstBlock = document.createElement('div');
          firstBlock.style.fontSize = sizeMap[size];
          firstBlock.innerHTML = '<br>';
          editorRef.current.appendChild(firstBlock);
          
          // 커서를 새 블록으로 이동
          const newRange = document.createRange();
          newRange.setStart(firstBlock, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // 블록을 찾지 못한 경우 첫 번째 블록 사용
          const firstBlock = editorRef.current.firstElementChild;
          if (firstBlock) {
            const currentOffset = range.startOffset;
            const currentContainer = range.startContainer;
            
            firstBlock.style.fontSize = sizeMap[size];
            
            // 커서 위치 복원
            setTimeout(() => {
              const newRange = document.createRange();
              if (currentContainer.nodeType === Node.TEXT_NODE) {
                newRange.setStart(currentContainer, Math.min(currentOffset, currentContainer.textContent.length));
              } else {
                const textNode = firstBlock.firstChild;
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                  newRange.setStart(textNode, Math.min(currentOffset, textNode.textContent.length));
                } else {
                  newRange.setStart(firstBlock, 0);
                }
              }
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }, 0);
          }
        }
      }
    }
    
    setFontSize(size);
    setShowDropdown(false);
    editorRef.current.focus();
  };

  // Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // 현재 블록 찾기
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }
        
        let blockElement = node;
        while (blockElement && blockElement !== editorRef.current) {
          if (blockElement.parentElement === editorRef.current) {
            break;
          }
          blockElement = blockElement.parentElement;
        }
        
        // 새 블록은 항상 기본 사이즈(Text - 14px)로 생성
        const newBlock = document.createElement('div');
        newBlock.style.fontSize = '14px';
        newBlock.innerHTML = '<br>';
        
        // 커서 위치에 삽입
        range.insertNode(newBlock);
        
        // 커서를 새 블록으로 이동
        const newRange = document.createRange();
        newRange.setStart(newBlock, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  };

  return (
    <div className={styles.notepad}>
      <div className={styles.toolbar}>
        <button 
          className={`${styles.toolButton} ${isBold ? styles.active : ''}`}
          onClick={toggleBold}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        
        <button 
          className={`${styles.toolButton} ${isItalic ? styles.active : ''}`}
          onClick={toggleItalic}
          title="Italic"
        >
          <em>I</em>
        </button>
        
        <button 
          className={`${styles.toolButton} ${isUnderline ? styles.active : ''}`}
          onClick={toggleUnderline}
          title="Underline"
        >
          <u>U</u>
        </button>
        
        <div className={styles.fontSizeContainer}>
          <button 
            className={`${styles.toolButton} ${styles.fontSizeButton}`}
            onClick={() => setShowDropdown(!showDropdown)}
            title="Font Size"
          >
            {fontSize}
            <span className={styles.dropdownArrow}>▼</span>
          </button>
          
          {showDropdown && (
            <div className={styles.dropdown}>
              <div 
                className={styles.dropdownItem}
                onClick={() => {
                  setFontSizeCommand('Text');
                  editorRef.current.focus();
                }}
              >
                Text
              </div>
              <div 
                className={styles.dropdownItem}
                onClick={() => {
                  setFontSizeCommand('Heading 3');
                  editorRef.current.focus();
                }}
              >
                Heading 3
              </div>
              <div 
                className={styles.dropdownItem}
                onClick={() => {
                  setFontSizeCommand('Heading 2');
                  editorRef.current.focus();
                }}
              >
                Heading 2
              </div>
              <div 
                className={styles.dropdownItem}
                onClick={() => {
                  setFontSizeCommand('Heading 1');
                  editorRef.current.focus();
                }}
              >
                Heading 1
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onMouseUp={updateButtonStates}
        onKeyUp={updateButtonStates}
        data-placeholder="Start typing..."
      />
    </div>
  );
}

export default TextEditApp;
