import React, { useState, useRef } from 'react';
import styles from './InternetApp.module.css';

// 사이트 데이터 정의
const siteData = {
  'youngwon.com': {
    logo: 'Youngwon',
    color: '#4285f4',
    placeholder: '무엇이든 검색하시오'
  },
  'google.com': {
    logo: 'Google',
    color: '#4285f4',
    placeholder: 'Google 검색'
  },
  'openai.com': {
    logo: 'OpenAI',
    color: '#10a37f',
    placeholder: 'OpenAI 검색'
  },
  'gemini.com': {
    logo: 'Gemini',
    color: '#8b5cf6',
    placeholder: 'Gemini 검색'
  }
};

function InternetApp() {
  const [currentUrl, setCurrentUrl] = useState('youngwon.com');
  const [urlInput, setUrlInput] = useState('youngwon.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState(['youngwon.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef(null);
  const jpopSectionRef = useRef(null);

  // 유튜브 영상 데이터
  const youtubeVideos = [
    {
      id: '-wb2PAx6aEs',
      title: '米津玄師 - さよーならまたいつか！'
    },
    {
      id: 'sPLqsLsooJY',
      title: '米津玄師, 宇多田ヒカル - JANE DOE'
    },
    {
      id: 'a8dgNdJVluc',
      title: 'サカナクション - 怪獣'
    }
  ];

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => {
      const next = prev + 1;
      return next >= youtubeVideos.length ? 0 : next;
    });
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? youtubeVideos.length - 1 : prevIndex;
    });
  };

  // 드래그 시작 (Carousel 영역에서만)
  const handleDragStart = (e) => {
    // Carousel 영역에서만 드래그 시작
    if (!carouselRef.current || !carouselRef.current.contains(e.target)) return;
    
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);
  };

  // 드래그 중
  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
  };

  // 드래그 종료
  const handleDragEnd = (e) => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50; // 드래그 최소 거리
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // 오른쪽으로 드래그 (다음 영상)
        nextVideo();
      } else {
        // 왼쪽으로 드래그 (이전 영상)
        prevVideo();
      }
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // 회전목마를 위한 슬라이드 배열 생성 (마지막, 모든 곡, 첫 번째)
  const carouselSlides = [
    youtubeVideos[youtubeVideos.length - 1], // 마지막 곡
    ...youtubeVideos, // 모든 곡
    youtubeVideos[0] // 첫 번째 곡
  ];
  
  // 실제 표시할 인덱스 (1부터 시작, 0은 마지막 곡, 마지막은 첫 번째 곡)
  const displayIndex = currentVideoIndex + 1;

  // HOME 버튼 클릭 - youngwon.com으로 새로고침
  const handleHomeClick = () => {
    setCurrentUrl('youngwon.com');
    setUrlInput('youngwon.com');
    setSearchQuery('');
    setCurrentVideoIndex(0);
    setHistory(['youngwon.com']);
    setHistoryIndex(0);
    // 페이지 상단으로 스크롤
    if (document.querySelector(`.${styles.youngwonPage}`)) {
      document.querySelector(`.${styles.youngwonPage}`).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // HOBBY 버튼 클릭 - jpop 섹션으로 스크롤
  const handleHobbyClick = () => {
    if (jpopSectionRef.current) {
      jpopSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 로고 아이콘들
  const YoungwonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="6" fill="#000000"/>
    </svg>
  );

  const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const OpenAIIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#10a37f" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4043-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z"/>
    </svg>
  );

  const GeminiIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285f4"/>
          <stop offset="50%" stopColor="#9b72cb"/>
          <stop offset="100%" stopColor="#d96570"/>
        </linearGradient>
      </defs>
      <path fill="url(#geminiGradient)" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.638 0 8.4 3.762 8.4 8.4s-3.762 8.4-8.4 8.4-8.4-3.762-8.4-8.4 3.762-8.4 8.4-8.4z"/>
      <path fill="url(#geminiGradient)" d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2z"/>
    </svg>
  );

  const quickLinks = [
    { name: 'Youngwon', url: 'youngwon.com', icon: YoungwonIcon },
    { name: 'Google', url: 'google.com', icon: GoogleIcon },
    { name: 'OpenAI', url: 'openai.com', icon: OpenAIIcon },
    { name: 'Gemini', url: 'gemini.com', icon: GeminiIcon }
  ];

  // URL 정규화 (www. 제거)
  const normalizeUrl = (url) => {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase();
  };

  const navigateToUrl = (url) => {
    const normalizedUrl = normalizeUrl(url);
    
    if (normalizedUrl === currentUrl) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(normalizedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(normalizedUrl);
    setUrlInput(normalizedUrl);
    setSearchQuery('');
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrlInput(history[newIndex]);
      setSearchQuery('');
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrlInput(history[newIndex]);
      setSearchQuery('');
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    navigateToUrl(urlInput);
  };

  const handleQuickLinkClick = (url) => {
    navigateToUrl(url);
  };

  const handleProjectButtonClick = () => {
    // 나중에 구현할 기능 - 프로젝트 화면으로 이동
    console.log('Navigate to projects');
  };

  // 현재 사이트 데이터 가져오기
  const currentSite = siteData[currentUrl] || {
    logo: currentUrl,
    color: '#333',
    placeholder: '검색'
  };

  return (
    <div className={styles.internet}>
      {/* 툴바 (주소창 + 바로가기) */}
      <div className={styles.toolbar}>
        <div className={styles.addressRow}>
          <div className={styles.navigationButtons}>
            <button 
              className={styles.navButton} 
              onClick={goBack}
              disabled={historyIndex === 0}
              title="뒤로가기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              className={styles.navButton} 
              onClick={goForward}
              disabled={historyIndex === history.length - 1}
              title="앞으로가기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <form className={styles.urlForm} onSubmit={handleUrlSubmit}>
            <input
              type="text"
              className={styles.urlInput}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="주소를 입력하세요"
            />
          </form>
        </div>
        <div className={styles.quickLinks}>
          {quickLinks.map((link, index) => (
            <button
              key={index}
              className={styles.quickLink}
              onClick={() => handleQuickLinkClick(link.url)}
              title={link.name}
            >
              <link.icon />
              <span>{link.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GNB - youngwon.com일 때만 표시 */}
      {currentUrl === 'youngwon.com' && (
        <div className={styles.gnb}>
          <div className={styles.gnbLeft}>
            <img 
              src="/영원로고.png" 
              alt="Youngwon" 
              className={styles.gnbLogo}
            />
          </div>
          <div className={styles.gnbCenter}>
            <button className={styles.gnbMenu} onClick={handleHomeClick}>HOME</button>
            <button className={styles.gnbMenu} onClick={handleHobbyClick}>HOBBY</button>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {currentUrl === 'youngwon.com' ? (
          <div className={styles.youngwonPage}>
            {/* 숲속 이미지 */}
            <div className={styles.forestImageContainer}>
              <img 
                src="/숲속이미지.jpeg" 
                alt="Forest" 
                className={styles.forestImage}
              />
            </div>
            
            {/* jpop おすすめ 섹션 */}
            <div className={styles.section} ref={jpopSectionRef}>
              <h2 className={styles.sectionTitle}>jpop おすすめ</h2>
              
              <div 
                className={styles.carouselWrapper}
                ref={carouselRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{ touchAction: 'pan-x' }}
              >
                <div 
                  className={styles.carouselTrack}
                  style={{
                    transform: `translateX(calc(${-displayIndex * 85}% - ${displayIndex * 20}px + 7.5%))`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                  }}
                >
                  {carouselSlides.map((video, index) => {
                    const isActive = index === displayIndex;
                    return (
                      <div 
                        key={`${video.id}-${index}`} 
                        className={`${styles.carouselSlide} ${isActive ? styles.active : ''}`}
                      >
                        <div className={styles.videoWrapper}>
                          {isActive ? (
                            <iframe
                              width="560"
                              height="315"
                              src={`https://www.youtube.com/embed/${video.id}`}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className={styles.youtubeVideo}
                            ></iframe>
                          ) : (
                            <div className={styles.videoPlaceholder}>
                              <div className={styles.placeholderContent}>
                                <span className={styles.playIcon}>▶</span>
                              </div>
                            </div>
                          )}
                          <p className={styles.videoTitle}>{video.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 인디케이터 */}
                <div className={styles.carouselIndicators}>
                  {youtubeVideos.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.indicator} ${index === currentVideoIndex ? styles.active : ''}`}
                      onClick={() => setCurrentVideoIndex(index)}
                      aria-label={`영상 ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.mainScreen}>
            {/* 로고 */}
            <div className={styles.logo}>
              <h1 
                className={styles.logoText}
                style={{ color: currentSite.color }}
              >
                {currentSite.logo}
              </h1>
            </div>

          {/* 검색창 - youngwon.com이 아닐 때만 표시 */}
          {currentUrl !== 'youngwon.com' && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchBox}
                placeholder={currentSite.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

            {/* 원형 버튼들 - youngwon.com이 아닐 때만 표시 */}
            {currentUrl !== 'youngwon.com' && (
              <div className={styles.projectButtons}>
                <button
                  className={styles.projectButton}
                  onClick={handleProjectButtonClick}
                  title="프로젝트"
                >
                  {/* 나중에 이미지 추가 */}
                </button>
                <button
                  className={styles.projectButton}
                  onClick={handleProjectButtonClick}
                  title="프로젝트"
                >
                  {/* 나중에 이미지 추가 */}
                </button>
                <button
                  className={styles.projectButton}
                  onClick={handleProjectButtonClick}
                  title="프로젝트"
                >
                  {/* 나중에 이미지 추가 */}
                </button>
                <button
                  className={styles.projectButton}
                  onClick={handleProjectButtonClick}
                  title="프로젝트"
                >
                  {/* 나중에 이미지 추가 */}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InternetApp;
