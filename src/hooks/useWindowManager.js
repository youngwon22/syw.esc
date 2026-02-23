import { useState, useCallback } from 'react';

/**
 * WindowManager - 창 위치, z-index, 포커스, 최대화 관리
 *
 * 각 창의 상태:
 * - id: 고유 ID
 * - processId: 연결된 프로세스 ID
 * - x, y: 위치
 * - width, height: 크기
 * - zIndex: 레이어 순서
 * - isMaximized: 최대화 여부
 * - isFocused: 포커스 여부
 * - isDimmed: 비활성(어둡게) 여부
 * - originalBounds: 최대화 전 원래 크기/위치 저장
 */

function useWindowManager() {
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [focusedWindowId, setFocusedWindowId] = useState(null);

  // 창 생성
  const create = useCallback((processId, config) => {
    const windowId = `window-${Date.now()}`;

    const newWindow = {
      id: windowId,
      processId,
      x: config.x ?? 100,
      y: config.y ?? 100,
      width: config.width ?? 600,
      height: config.height ?? 400,
      zIndex: nextZIndex,
      isMaximized: false,
      isFocused: true,
      isDimmed: false,
      originalBounds: null,
    };

    setWindows(prev => {
      // 기존 창들은 포커스 해제 및 dimmed 처리
      const updated = prev.map(w => ({
        ...w,
        isFocused: false,
        isDimmed: true,
      }));
      return [...updated, newWindow];
    });

    setNextZIndex(prev => prev + 1);
    setFocusedWindowId(windowId);

    return windowId;
  }, [nextZIndex]);

  // 창 닫기
  const close = useCallback((windowId) => {
    setWindows(prev => {
      const filtered = prev.filter(w => w.id !== windowId);

      // 남은 창이 있으면 마지막 창에 포커스
      if (filtered.length > 0) {
        const lastWindow = filtered.reduce((max, w) =>
          w.zIndex > max.zIndex ? w : max
        , filtered[0]);

        return filtered.map(w => ({
          ...w,
          isFocused: w.id === lastWindow.id,
          isDimmed: w.id !== lastWindow.id,
        }));
      }

      return filtered;
    });

    if (focusedWindowId === windowId) {
      setFocusedWindowId(null);
    }
  }, [focusedWindowId]);

  // 포커스 (z-index 최상위로 + isFocused/isDimmed 업데이트)
  const focus = useCallback((windowId) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      zIndex: w.id === windowId ? nextZIndex : w.zIndex,
      isFocused: w.id === windowId,
      isDimmed: w.id !== windowId,
    })));

    setNextZIndex(prev => prev + 1);
    setFocusedWindowId(windowId);
  }, [nextZIndex]);

  // 최대화/복원 토글
  const maximize = useCallback((windowId, screenSize) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== windowId) return w;

      if (w.isMaximized) {
        // 복원
        const bounds = w.originalBounds || { x: 100, y: 100, width: 600, height: 400 };
        return {
          ...w,
          isMaximized: false,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          originalBounds: null,
        };
      } else {
        // 최대화
        const maxWidth = screenSize.width * 0.8;
        const maxHeight = (screenSize.height - 24) * 0.8;
        const centerX = (screenSize.width - maxWidth) / 2;
        const centerY = (screenSize.height - 24 - maxHeight) / 2;

        return {
          ...w,
          isMaximized: true,
          originalBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: centerX,
          y: centerY,
          width: maxWidth,
          height: maxHeight,
        };
      }
    }));
  }, []);

  // 크기/위치 업데이트
  const update = useCallback((windowId, updates) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, ...updates } : w
    ));
  }, []);

  // 특정 창 조회
  const getWindow = useCallback((windowId) => {
    return windows.find(w => w.id === windowId);
  }, [windows]);

  // processId로 창 찾기
  const findByProcessId = useCallback((processId) => {
    return windows.find(w => w.processId === processId);
  }, [windows]);

  return {
    windows,
    focusedWindowId,
    create,
    close,
    focus,
    maximize,
    update,
    getWindow,
    findByProcessId,
  };
}

export default useWindowManager;
