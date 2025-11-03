import React, { useState } from 'react';
import styles from './MenuBar.module.css';
import { useSound } from '../hooks/useSound';

// Google Fonts에서 Libre Bodoni 로드
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

function MenuBar() {
  const [showAppleDropdown, setShowAppleDropdown] = useState(false);
  const [showYoungwonDropdown, setShowYoungwonDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isAppOpening, setIsAppOpening] = useState(false);

  // 사운드 훅 사용
  const { playSound } = useSound(0.3);

  // 모든 드롭다운 닫기
  const closeAllDropdowns = () => {
    setShowAppleDropdown(false);
    setShowYoungwonDropdown(false);
    setShowFileDropdown(false);
    setShowEditDropdown(false);
    setShowViewDropdown(false);
    setShowHelpDropdown(false);
  };

  const handleAppleClick = () => {
    const wasOpen = showAppleDropdown;
    const anyOtherOpen = showYoungwonDropdown || showFileDropdown || showEditDropdown || showViewDropdown || showHelpDropdown;
    
    closeAllDropdowns();
    
    // 다른 드롭다운이 열려있지 않고, 현재 드롭다운이 닫혀있을 때만 열기
    if (!anyOtherOpen && !wasOpen) {
      setShowAppleDropdown(true);
    }
  };

  const handleYoungwonClick = () => {
    const wasOpen = showYoungwonDropdown;
    const anyOtherOpen = showAppleDropdown || showFileDropdown || showEditDropdown || showViewDropdown || showHelpDropdown;
    
    closeAllDropdowns();
    
    if (!anyOtherOpen && !wasOpen) {
      setShowYoungwonDropdown(true);
    }
  };

  const handleFileClick = () => {
    const wasOpen = showFileDropdown;
    const anyOtherOpen = showAppleDropdown || showYoungwonDropdown || showEditDropdown || showViewDropdown || showHelpDropdown;
    
    closeAllDropdowns();
    
    if (!anyOtherOpen && !wasOpen) {
      setShowFileDropdown(true);
    }
  };

  const handleEditClick = () => {
    const wasOpen = showEditDropdown;
    const anyOtherOpen = showAppleDropdown || showYoungwonDropdown || showFileDropdown || showViewDropdown || showHelpDropdown;
    
    closeAllDropdowns();
    
    if (!anyOtherOpen && !wasOpen) {
      setShowEditDropdown(true);
    }
  };

  const handleViewClick = () => {
    const wasOpen = showViewDropdown;
    const anyOtherOpen = showAppleDropdown || showYoungwonDropdown || showFileDropdown || showEditDropdown || showHelpDropdown;
    
    closeAllDropdowns();
    
    if (!anyOtherOpen && !wasOpen) {
      setShowViewDropdown(true);
    }
  };

  const handleHelpClick = () => {
    const wasOpen = showHelpDropdown;
    const anyOtherOpen = showAppleDropdown || showYoungwonDropdown || showFileDropdown || showEditDropdown || showViewDropdown;
    
    closeAllDropdowns();
    
    if (!anyOtherOpen && !wasOpen) {
      setShowHelpDropdown(true);
    }
  };

  const handleAppClick = (appType) => {
    // 앱 열기 플래그 설정
    setIsAppOpening(true);
    
    // 전역 이벤트를 발생시켜 Desktop에서 앱을 열도록 함
    window.dispatchEvent(new CustomEvent('openApp', { detail: appType }));
    
    // 드롭다운 닫기
    setShowAppleDropdown(false);
    setShowYoungwonDropdown(false);
    setShowFileDropdown(false);
    setShowEditDropdown(false);
    setShowViewDropdown(false);
    setShowHelpDropdown(false);
    
    // 앱 열기 사운드 재생
    playSound('WindowOpen.mp3');
    
    // 플래그 리셋
    setTimeout(() => setIsAppOpening(false), 200);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.appleMenu}`) && 
        !e.target.closest(`.${styles.youngwonMenu}`) &&
        !e.target.closest(`.${styles.fileMenu}`) &&
        !e.target.closest(`.${styles.editMenu}`) &&
        !e.target.closest(`.${styles.viewMenu}`) &&
        !e.target.closest(`.${styles.helpMenu}`)) {
      closeAllDropdowns();
    }
  };

  const updateTime = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const day = dayNames[now.getDay()];
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    setCurrentTime(`${month}월 ${date}일 (${day}) ${period} ${displayHours}:${minutes}`);
  };

  // 드롭다운 상태 변화 감지 및 사운드 재생
  React.useEffect(() => {
    const anyDropdownOpen = showAppleDropdown || showYoungwonDropdown || showFileDropdown || 
                          showEditDropdown || showViewDropdown || showHelpDropdown;
    
    if (anyDropdownOpen) {
      console.log('드롭다운 열림 사운드 재생');
      playSound('MenuOpen.mp3');
    } else if (!isAppOpening) {
      // 앱이 열리는 중이 아닐 때만 닫힘 사운드 재생
      console.log('드롭다운 닫힘 사운드 재생');
      playSound('MenuClose.mp3');
    }
  }, [showAppleDropdown, showYoungwonDropdown, showFileDropdown, showEditDropdown, showViewDropdown, showHelpDropdown, isAppOpening]);

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    updateTime(); // 초기 시간 설정
    const interval = setInterval(updateTime, 1000); // 1초마다 업데이트
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.menuBar}>
      <div className={styles.appleMenu}>
        <div className={styles.appleLogo} onClick={handleAppleClick}>
          <img src="/icon/apple.png" alt="Apple" width="26" height="24" />
        </div>
        {showAppleDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>About This SYWESC</div>
            <div className={styles.separator}></div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('Finder')}>
              <img src="/icon/파인더.png" alt="Finder" className={styles.appIcon} />
              <span>Finder</span>
            </div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('Music')}>
              <img src="/icon/음악 앱.png" alt="Music" className={styles.appIcon} />
              <span>Music</span>
            </div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('Notepad')}>
              <img src="/icon/text.png" alt="TextEdit" className={styles.appIcon} />
              <span>TextEdit</span>
            </div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('Album')}>
              <img src="/icon/앨범 앱.png" alt="Album" className={styles.appIcon} />
              <span>Album</span>
            </div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('Chats')}>
              <img src="/icon/맥 chat.png" alt="Chats" className={styles.appIcon} />
              <span>Chats</span>
            </div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('PhotoBooth')}>
              <img src="/icon/포토부스.png" alt="Photo Booth" className={styles.appIcon} />
              <span>Photo Booth</span>
            </div>
            <div className={`${styles.dropdownItem} ${styles.appDropdownItem}`} onClick={() => handleAppClick('DinoGame')}>
              <img src="/icon/공룡게임.svg" alt="Dino Game" className={styles.appIcon} />
              <span>Dino Game</span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.youngwonMenu}>
        <div className={`${styles.menuItem} ${styles.noLeftMargin}`} onClick={handleYoungwonClick}>
          Youngwon
        </div>
        {showYoungwonDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>
              <span style={{color: '#666', fontSize: '11px'}}>Name</span><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>Youngwon Song</div>
            </div>
            <div className={styles.separator} />
            <div className={styles.dropdownItem}>
              <span style={{color: '#666', fontSize: '11px'}}>Birth</span><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>2001 / 03 / 11</div>
            </div>
            <div className={styles.separator} />
            <div className={styles.dropdownItem}>
              <span style={{color: '#666', fontSize: '11px'}}>Major</span><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>Software (2020~)</div>
            </div>
            <div className={styles.separator} />
            <div className={styles.dropdownItem}>
              <span style={{color: '#666', fontSize: '11px'}}>Hobby</span><br />
              <div style={{marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'}}>Music, Anime, Game</div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.fileMenu}>
        <div className={styles.menuItem} onClick={handleFileClick}>File</div>
        {showFileDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>Empty</div>
          </div>
        )}
      </div>
      <div className={styles.editMenu}>
        <div className={styles.menuItem} onClick={handleEditClick}>Edit</div>
        {showEditDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>Empty</div>
          </div>
        )}
      </div>
      <div className={styles.viewMenu}>
        <div className={styles.menuItem} onClick={handleViewClick}>View</div>
        {showViewDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>Empty</div>
          </div>
        )}
      </div>
      <div className={styles.helpMenu}>
        <div className={styles.menuItem} onClick={handleHelpClick}>Help</div>
        {showHelpDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem}>Empty</div>
          </div>
        )}
      </div>
      <div className={styles.timeDisplay}>
        {currentTime}
      </div>
    </div>
  );
}

export default MenuBar;
