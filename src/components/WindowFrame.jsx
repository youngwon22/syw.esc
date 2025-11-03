import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import styles from './WindowFrame.module.css';

function WindowFrame({ title, children, onClose, onFocus, onMaximize, onResize, x, y, width, height, zIndex, isMaximized }) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef(null);
  const moveMovingSoundRef = useRef(null);
  const moveStopSoundRef = useRef(null);
  const isDraggingRef = useRef(false);
  const resizeResizingSoundRef = useRef(null);
  const resizeStopSoundRef = useRef(null);

  const handleStart = () => {
    onFocus();
    isDraggingRef.current = true;
    
    // 드래그 시작 시 이동 중 소리 재생
    if (!moveMovingSoundRef.current) {
      moveMovingSoundRef.current = new Audio('/sounds/ryos/WindowMoveMoving.mp3');
      moveMovingSoundRef.current.loop = true;
      moveMovingSoundRef.current.volume = 0.5;
    }
    
    if (moveMovingSoundRef.current.paused) {
      moveMovingSoundRef.current.play().catch(err => console.log('Sound play error:', err));
    }
  };

  const handleDrag = (e, data) => {
    // 드래그 중에는 위치를 업데이트하지 않음 (성능상 이유)
    // 드래그가 끝날 때만 위치를 업데이트
    
    // 이동 중 소리가 멈춰있다면 재생
    if (isDraggingRef.current && moveMovingSoundRef.current && moveMovingSoundRef.current.paused) {
      moveMovingSoundRef.current.play().catch(err => console.log('Sound play error:', err));
    }
  };

  const handleStop = (e, data) => {
    // 드래그가 끝났을 때 위치 업데이트
    onResize(width, height, data.x, data.y);
    
    // 이동 중 소리 중지
    if (moveMovingSoundRef.current && !moveMovingSoundRef.current.paused) {
      moveMovingSoundRef.current.pause();
      moveMovingSoundRef.current.currentTime = 0;
    }
    
    // 정지 소리 재생
    if (!moveStopSoundRef.current) {
      moveStopSoundRef.current = new Audio('/sounds/ryos/WindowMoveStop.mp3');
      moveStopSoundRef.current.volume = 0.5;
    }
    
    moveStopSoundRef.current.currentTime = 0;
    moveStopSoundRef.current.play().catch(err => console.log('Sound play error:', err));
    
    isDraggingRef.current = false;
  };

  const handleMaximize = () => {
    console.log('Maximize button clicked!');
    onMaximize();
  };

  const handleBorderMouseDown = (e, direction) => {
    if (isMaximized) return;
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: width,
      height: height,
      direction: direction
    });
    
    // 리사이즈 시작 시 리사이징 소리 재생
    if (!resizeResizingSoundRef.current) {
      resizeResizingSoundRef.current = new Audio('/sounds/ryos/WindowResizeResizing.mp3');
      resizeResizingSoundRef.current.loop = true;
      resizeResizingSoundRef.current.volume = 0.5;
    }
    
    if (resizeResizingSoundRef.current.paused) {
      resizeResizingSoundRef.current.play().catch(err => console.log('Resize sound play error:', err));
    }
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    let newX = x;
    let newY = y;
    
    if (resizeStart.direction.includes('right')) {
      newWidth = Math.max(200, resizeStart.width + deltaX);
    }
    if (resizeStart.direction.includes('left')) {
      newWidth = Math.max(200, resizeStart.width - deltaX);
      newX = x + (resizeStart.width - newWidth);
    }
    if (resizeStart.direction.includes('bottom')) {
      newHeight = Math.max(150, resizeStart.height + deltaY);
    }
    if (resizeStart.direction.includes('top')) {
      newHeight = Math.max(150, resizeStart.height - deltaY);
      newY = y + (resizeStart.height - newHeight);
    }
    
    onResize(newWidth, newHeight, newX, newY);
    
    // 리사이징 중 소리가 멈춰있다면 재생
    if (resizeResizingSoundRef.current && resizeResizingSoundRef.current.paused) {
      resizeResizingSoundRef.current.play().catch(err => console.log('Resize sound play error:', err));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    
    // 리사이징 소리 중지
    if (resizeResizingSoundRef.current && !resizeResizingSoundRef.current.paused) {
      resizeResizingSoundRef.current.pause();
      resizeResizingSoundRef.current.currentTime = 0;
    }
    
    // 리사이즈 정지 소리 재생
    if (!resizeStopSoundRef.current) {
      resizeStopSoundRef.current = new Audio('/sounds/ryos/WindowResizeStop.mp3');
      resizeStopSoundRef.current.volume = 0.5;
    }
    
    resizeStopSoundRef.current.currentTime = 0;
    resizeStopSoundRef.current.play().catch(err => console.log('Resize stop sound play error:', err));
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeStart]);

  return (
    <Draggable
      position={{ x, y }}
      handle=".titleBar"
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
      disabled={isMaximized}
    >
      <div 
        ref={windowRef}
        className={styles.windowFrame}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          zIndex: zIndex
        }}
      >
        <div className={`${styles.titleBar} titleBar`}>
          <div className={styles.trafficLights}>
            <button 
              className={`${styles.trafficLight} ${styles.close}`}
              onClick={onClose}
            />
            <button className={`${styles.trafficLight} ${styles.minimize}`} />
            <button 
              className={`${styles.trafficLight} ${styles.maximize}`}
              onClick={handleMaximize}
            />
          </div>
          <div className={styles.title}>{title}</div>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        {/* Top border */}
        <div 
          className={styles.resizeBorderTop}
          onMouseDown={(e) => handleBorderMouseDown(e, 'top')}
        />
        {/* Right border */}
        <div 
          className={styles.resizeBorderRight}
          onMouseDown={(e) => handleBorderMouseDown(e, 'right')}
        />
        {/* Bottom border */}
        <div 
          className={styles.resizeBorderBottom}
          onMouseDown={(e) => handleBorderMouseDown(e, 'bottom')}
        />
        {/* Left border */}
        <div 
          className={styles.resizeBorderLeft}
          onMouseDown={(e) => handleBorderMouseDown(e, 'left')}
        />
        {/* Top-left corner */}
        <div 
          className={styles.resizeBorderTopLeft}
          onMouseDown={(e) => handleBorderMouseDown(e, 'top left')}
        />
        {/* Top-right corner */}
        <div 
          className={styles.resizeBorderTopRight}
          onMouseDown={(e) => handleBorderMouseDown(e, 'top right')}
        />
        {/* Bottom-left corner */}
        <div 
          className={styles.resizeBorderBottomLeft}
          onMouseDown={(e) => handleBorderMouseDown(e, 'bottom left')}
        />
        {/* Bottom-right corner */}
        <div 
          className={styles.resizeBorderBottomRight}
          onMouseDown={(e) => handleBorderMouseDown(e, 'bottom right')}
        />
      </div>
    </Draggable>
  );
}

export default WindowFrame;
