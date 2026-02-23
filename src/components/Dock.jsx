import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import styles from './Dock.module.css';
import { APP_CONFIG } from '../hooks/useProcessManager.jsx';

function Dock({ onOpenApp, onOpenTrash, runningApps = [] }) {
  const dockRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);
  const [clickedId, setClickedId] = useState(null);
  const [exitingApps, setExitingApps] = useState([]); // 사라지는 중인 앱들
  const prevRunningAppsRef = useRef([]);

  // 고정된 Dock 앱들
  const dockItems = [
    { id: 'Finder', icon: '/icon/파인더.png', name: 'Finder' },
    { id: 'Chats', icon: '/icon/맥 chat.png', name: 'Chats' },
    { id: 'Internet', icon: '/icon/internet.png', name: 'Internet' },
  ];

  // 고정 앱 ID 목록
  const pinnedAppIds = dockItems.map(item => item.id);

  // Dock에 고정되지 않은 실행 중인 앱들
  const runningNonPinnedApps = useMemo(() => {
    return runningApps
      .filter(appId => !pinnedAppIds.includes(appId))
      .map(appId => {
        const config = APP_CONFIG[appId] || {};
        return {
          id: appId,
          icon: config.icon || '/icon/default.png',
          name: config.title || appId,
        };
      });
  }, [runningApps, pinnedAppIds]);

  // 앱이 종료될 때 감지하여 exit 애니메이션 트리거
  useEffect(() => {
    const prevNonPinned = prevRunningAppsRef.current.filter(id => !pinnedAppIds.includes(id));
    const currentNonPinned = runningApps.filter(id => !pinnedAppIds.includes(id));

    // 이전에 있었는데 현재 없는 앱 = 종료된 앱
    const closedApps = prevNonPinned.filter(id => !currentNonPinned.includes(id));

    if (closedApps.length > 0) {
      // 종료된 앱 정보 저장
      const closedAppItems = closedApps.map(appId => {
        const config = APP_CONFIG[appId] || {};
        return {
          id: appId,
          icon: config.icon || '/icon/default.png',
          name: config.title || appId,
        };
      });

      setExitingApps(prev => [...prev, ...closedAppItems]);

      // 애니메이션 후 제거
      setTimeout(() => {
        setExitingApps(prev => prev.filter(app => !closedApps.includes(app.id)));
      }, 250);
    }

    prevRunningAppsRef.current = runningApps;
  }, [runningApps, pinnedAppIds]);

  // 화면에 표시할 비고정 앱들 (실행 중 + 사라지는 중)
  const displayedNonPinnedApps = useMemo(() => {
    const running = runningNonPinnedApps.map(app => ({ ...app, isExiting: false }));
    const exiting = exitingApps.map(app => ({ ...app, isExiting: true }));
    // 실행 중인 앱 뒤에 사라지는 앱 추가 (중복 제거)
    const exitingIds = exiting.map(a => a.id);
    return [...running.filter(a => !exitingIds.includes(a.id)), ...exiting];
  }, [runningNonPinnedApps, exitingApps]);

  // 설정값
  const baseSize = 44;
  const maxScale = 1.5;
  const hoverRange = 100;
  const separatorWidth = 18; // 구분선 너비 (margin 포함)

  // 실행 중인 비고정 앱 존재 여부
  const hasRunningNonPinned = runningNonPinnedApps.length > 0;

  // Gaussian 함수 - 위치 기반으로 scale 계산
  const getScaleByPosition = (positionX) => {
    if (mouseX === null) return 1;

    const distance = Math.abs(mouseX - positionX);
    if (distance > hoverRange) return 1;

    const sigma = hoverRange / 2.2;
    const scale = 1 + (maxScale - 1) * Math.exp(-(distance * distance) / (2 * sigma * sigma));
    return scale;
  };

  // 고정 앱용 scale (왼쪽 영역)
  const getScale = (index) => {
    const iconCenter = 12 + index * (baseSize + 6) + baseSize / 2;
    return getScaleByPosition(iconCenter);
  };

  // 실행 중인 비고정 앱용 scale (중간 영역)
  const getRunningAppScale = (index) => {
    // 고정 앱들 + 첫 번째 구분선 다음 위치
    const startX = 12 + dockItems.length * (baseSize + 6) + separatorWidth;
    const iconCenter = startX + index * (baseSize + 6) + baseSize / 2;
    return getScaleByPosition(iconCenter);
  };

  // 휴지통용 scale (맨 오른쪽)
  const getTrashScale = () => {
    // 고정 앱들 + 첫 번째 구분선
    let startX = 12 + dockItems.length * (baseSize + 6) + separatorWidth;

    // 실행 중인 비고정 앱이 있으면 그 영역 + 두 번째 구분선 추가
    if (hasRunningNonPinned) {
      startX += runningNonPinnedApps.length * (baseSize + 6) + separatorWidth;
    }

    const iconCenter = startX + baseSize / 2;
    return getScaleByPosition(iconCenter);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const handleClick = (id) => {
    setClickedId(id);
    setTimeout(() => setClickedId(null), 400);
    onOpenApp(id);
  };

  const handleTrashClick = () => {
    setClickedId('Trash');
    setTimeout(() => setClickedId(null), 400);
    if (onOpenTrash) {
      onOpenTrash();
    }
  };

  const trashScale = getTrashScale();
  const trashSize = baseSize * trashScale;
  const trashTranslateY = -(trashSize - baseSize) * 0.6;

  return (
    <div className={styles.dockContainer}>
      <div
        ref={dockRef}
        className={styles.dock}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 앱 아이콘들 */}
        {dockItems.map((item, index) => {
          const isRunning = runningApps.includes(item.id);
          const isClicked = clickedId === item.id;
          const scale = getScale(index);
          const size = baseSize * scale;
          const translateY = -(size - baseSize) * 0.6;

          return (
            <div
              key={item.id}
              className={`${styles.dockItem} ${isClicked ? styles.bounce : ''}`}
              onClick={() => handleClick(item.id)}
              style={{
                width: size,
                height: size,
                transform: `translateY(${translateY}px)`,
              }}
            >
              <img
                src={item.icon}
                alt={item.name}
                className={styles.dockIcon}
                draggable={false}
              />
              <span className={styles.tooltip}>{item.name}</span>
              {isRunning && <div className={styles.indicator} />}
            </div>
          );
        })}

        {/* 첫 번째 구분선 */}
        <div className={styles.separator} />

        {/* 실행 중인 비고정 앱들 */}
        {displayedNonPinnedApps.map((item, index) => {
          const isClicked = clickedId === item.id;
          const scale = getRunningAppScale(index);
          const size = baseSize * scale;
          const translateY = -(size - baseSize) * 0.6;

          return (
            <div
              key={item.id}
              className={`${styles.dockItem} ${item.isExiting ? styles.popOut : styles.popIn} ${isClicked ? styles.bounce : ''}`}
              onClick={() => !item.isExiting && handleClick(item.id)}
              style={{
                width: size,
                height: size,
                transform: `translateY(${translateY}px)`,
                pointerEvents: item.isExiting ? 'none' : 'auto',
              }}
            >
              <img
                src={item.icon}
                alt={item.name}
                className={styles.dockIcon}
                draggable={false}
              />
              <span className={styles.tooltip}>{item.name}</span>
              {/* 실행 중인 앱이므로 항상 indicator 표시 */}
              <div className={styles.indicator} />
            </div>
          );
        })}

        {/* 두 번째 구분선 (실행 중인 비고정 앱이 있을 때만) */}
        {(hasRunningNonPinned || exitingApps.length > 0) && <div className={styles.separator} />}

        {/* 휴지통 */}
        <div
          className={`${styles.dockItem} ${clickedId === 'Trash' ? styles.bounce : ''}`}
          onClick={handleTrashClick}
          style={{
            width: trashSize,
            height: trashSize,
            transform: `translateY(${trashTranslateY}px)`,
          }}
        >
          <div className={styles.trashIcon}>
            🗑️
          </div>
          <span className={styles.tooltip}>Trash</span>
        </div>
      </div>
    </div>
  );
}

export default Dock;
