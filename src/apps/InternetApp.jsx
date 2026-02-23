import React, { useState, useRef, useEffect } from 'react';
import styles from './InternetApp.module.css';

// Apple Time Machine 연도별 대표 날짜 (Wayback Machine용)
// 각 연도의 대표적인 제품 발표/디자인 트렌드 피크 시점 기준
const appleTimeMachineData = {
  2001: '20011023', // iPod 발표 (10월 23일) - "1,000 songs in your pocket"
  2002: '20020107', // iMac G4 발표 (1월 7일) - 플랫 패널 디스플레이
  2003: '20030428', // iTunes Music Store 발표 (4월 28일) - 디지털 음악 혁명
  2004: '20040106', // iPod mini 발표 (1월 6일) - 컬러풀한 작은 iPod
  2005: '20050111', // Mac mini, iPod shuffle 발표 (1월 11일) - 저렴한 Mac 시대
  2006: '20060110', // MacBook Pro 발표 (1월 10일) - Intel 전환 시작
  2007: '20070109', // iPhone 발표 (1월 9일) - "Reinvent the phone"
  2008: '20080115', // MacBook Air 발표 (1월 15일) - 봉투에서 꺼내는 노트북
  2009: '20090608', // iPhone 3GS 발표 (6월 8일) - "The fastest iPhone yet"
  2010: '20100127', // iPad 발표 (1월 27일) - 태블릿 혁명
  2011: '20111005', // 스티브 잡스 별세 (10월 5일) - 애플 역사의 전환점
  2012: '20120912', // iPhone 5 발표 (9월 12일) - 더 크고 얇은 디자인
  2013: '20130910', // iPhone 5s/5c 발표 (9월 10일) - Touch ID, iOS 7 플랫 디자인
  2014: '20140909', // iPhone 6/Plus 발표 (9월 9일) - 대화면 시대
  2015: '20150309', // Apple Watch 발표 (3월 9일) - 웨어러블 진출
  2016: '20160907', // iPhone 7 발표 (9월 7일) - 헤드폰 잭 제거, AirPods
  2017: '20170912', // iPhone X 발표 (9월 12일) - 노치, Face ID, 10주년 모델
  2018: '20180912', // iPhone XS 발표 (9월 12일) - 더 큰 OLED
  2019: '20190910', // iPhone 11 Pro 발표 (9월 10일) - 트리플 카메라
  2020: '20201110', // M1 Mac 발표 (11월 10일) - Apple Silicon 시작
  2021: '20211018', // M1 Pro/Max MacBook Pro 발표 (10월 18일) - 노치, 프로급 성능
  2022: '20220907', // iPhone 14 발표 (9월 7일) - Dynamic Island
  2023: '20230912', // iPhone 15 발표 (9월 12일) - USB-C 전환
  2024: '20240202', // Vision Pro 출시 (2월 2일) - 공간 컴퓨팅 시대
  2025: '20250115', // 현재
};


// 사이트 데이터 정의
const siteData = {
  'apple.com': {
    logo: 'Apple',
    color: '#000000',
    placeholder: '검색'
  },
  'youngwon.com': {
    logo: 'Youngwon',
    color: '#4285f4',
    placeholder: '무엇이든 검색하시오'
  },
  'ghibli-park.jp': {
    logo: 'ジブリパーク',
    color: '#5ba3a0',
    placeholder: '検索'
  },
  'mancity.com': {
    logo: 'Manchester City',
    color: '#6CABDD',
    placeholder: 'Search'
  },
  'netflix.com': {
    logo: 'Netflix',
    color: '#e50914',
    placeholder: '검색'
  }
};

// 가짜 검색 결과 생성 함수
const generateSearchResults = (query) => {
  if (!query.trim()) return [];

  // 쿼리에 따른 다양한 검색 결과 생성
  const templates = [
    {
      title: `${query} - Wikipedia, the free encyclopedia`,
      url: `en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
      description: `${query} is a topic that has been extensively documented. This article provides comprehensive information about ${query}, including its history, significance, and related subjects...`
    },
    {
      title: `${query} | Official Website`,
      url: `www.${query.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `Welcome to the official ${query} website. Discover the latest news, updates, and information about ${query}. Join millions of users worldwide...`
    },
    {
      title: `What is ${query}? - Definition and Meaning`,
      url: `www.dictionary.com/browse/${query.replace(/\s+/g, '-')}`,
      description: `${query} definition: Learn the meaning of ${query} and how it is used in various contexts. See examples, synonyms, and related words...`
    },
    {
      title: `${query} News - Latest Updates and Headlines`,
      url: `news.google.com/search?q=${query.replace(/\s+/g, '+')}`,
      description: `Get the latest news about ${query}. Stay updated with breaking news, articles, and analysis from trusted sources around the world...`
    },
    {
      title: `Buy ${query} Online - Best Prices & Deals`,
      url: `www.amazon.com/s?k=${query.replace(/\s+/g, '+')}`,
      description: `Shop for ${query} online. Compare prices, read reviews, and find the best deals. Free shipping on eligible orders. Millions of items available...`
    },
    {
      title: `${query} - YouTube`,
      url: `www.youtube.com/results?search_query=${query.replace(/\s+/g, '+')}`,
      description: `Watch ${query} videos on YouTube. Enjoy millions of the latest videos, music, tutorials, and more. Subscribe to channels and share with friends...`
    },
    {
      title: `How to ${query} - Complete Guide (2010)`,
      url: `www.wikihow.com/${query.replace(/\s+/g, '-')}`,
      description: `Learn how to ${query} with this comprehensive step-by-step guide. Includes tips, tricks, and expert advice for beginners and advanced users...`
    },
    {
      title: `${query} Images - Free Photos & Pictures`,
      url: `images.google.com/images?q=${query.replace(/\s+/g, '+')}`,
      description: `Browse thousands of ${query} images. Find high-quality photos, pictures, and illustrations. Free to use and share...`
    },
    {
      title: `${query} Forum - Community Discussion`,
      url: `forums.${query.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `Join the ${query} community forum. Ask questions, share experiences, and connect with other enthusiasts. Active discussions and helpful members...`
    },
    {
      title: `The History of ${query} - A Comprehensive Overview`,
      url: `www.history.com/topics/${query.replace(/\s+/g, '-')}`,
      description: `Explore the fascinating history of ${query}. From its origins to the present day, discover how ${query} has evolved and shaped our world...`
    }
  ];

  // 랜덤하게 6-8개 결과 선택
  const shuffled = templates.sort(() => 0.5 - Math.random());
  const count = 6 + Math.floor(Math.random() * 3);

  return shuffled.slice(0, count);
};

function InternetApp() {
  const [currentUrl, setCurrentUrl] = useState('apple.com');
  const [urlInput, setUrlInput] = useState('apple.com');
  const [searchQuery, setSearchQuery] = useState('');
  const [googleSearchResults, setGoogleSearchResults] = useState(null); // 검색 결과 상태
  const [history, setHistory] = useState(['apple.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2001); // Time Machine 기본 연도 ('current' 또는 숫자)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false); // 연도 선택 드롭다운 열림 상태
  const [isWaybackLoading, setIsWaybackLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const jpopSectionRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const mancityVideoSectionRef = useRef(null);
  const mancityVideoRef = useRef(null);
  const mancityShopSectionRef = useRef(null);
  const contentRef = useRef(null);
  const yearDropdownRef = useRef(null);

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
      if (next >= youtubeVideos.length) {
        // 마지막에서 첫 번째로: 복제본을 통해 부드럽게 이동
        setIsTransitioning(true);
        // 먼저 복제본 위치로 이동 (transition 있음)
        setTimeout(() => {
          // transition이 끝난 후 실제 위치로 재설정 (transition 없음)
          setCurrentVideoIndex(0);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 300);
        return youtubeVideos.length - 1; // 임시로 마지막 유지
      }
      return next;
    });
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) {
        // 첫 번째에서 마지막으로: 복제본을 통해 부드럽게 이동
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentVideoIndex(youtubeVideos.length - 1);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 300);
        return 0; // 임시로 첫 번째 유지
      }
      return prevIndex;
    });
  };


  // 드래그 시작 (Carousel 영역에서만)
  const handleDragStart = (e) => {
    // iframe 위에서도 드래그 가능하도록 처리
    const target = e.target;
    if (target.tagName === 'IFRAME') {
      e.preventDefault();
      setIsDragging(true);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setStartX(clientX);
      setCurrentX(clientX);
      return;
    }
    
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

  // 연도 변경 시 로딩 상태 리셋
  useEffect(() => {
    setIsWaybackLoading(true);
  }, [selectedYear]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // 회전목마를 위한 슬라이드 배열 생성 (마지막, 모든 곡, 첫 번째)
  const carouselSlides = [
    youtubeVideos[youtubeVideos.length - 1], // 마지막 곡
    ...youtubeVideos, // 모든 곡
    youtubeVideos[0] // 첫 번째 곡
  ];
  
  // 실제 표시할 인덱스 (1부터 시작, 0은 마지막 곡, 마지막은 첫 번째 곡)
  // 무한 루프를 위해 복제본 사용
  let displayIndex = currentVideoIndex + 1;
  
  // 마지막에서 첫 번째로 넘어갈 때: 첫 번째 복제본(youtubeVideos.length + 1) 사용
  if (currentVideoIndex === youtubeVideos.length - 1 && isTransitioning) {
    displayIndex = youtubeVideos.length + 1;
  }
  // 첫 번째에서 마지막으로 넘어갈 때: 마지막 복제본(0) 사용  
  else if (currentVideoIndex === 0 && isTransitioning) {
    displayIndex = 0;
  }

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

  // 넷플릭스 아이콘 (N 로고)
  const NetflixIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#e50914" d="M5.398 0v24l6.735-2.258V0H5.398zm6.735 0v21.742L18.602 24V0h-6.469zM5.398 0l6.735 24h6.469L12.133 0H5.398z"/>
    </svg>
  );

  // 맨시티 아이콘
  const ManCityIcon = () => (
    <img
      src="/internet/mancity/city logo.svg"
      alt="Man City"
      style={{
        width: '16px',
        height: '16px',
        objectFit: 'contain'
      }}
    />
  );

  // 애플 아이콘
  const AppleIcon = () => (
    <img
      src="/icon/사과이미지.png"
      alt="Apple"
      style={{
        width: '16px',
        height: '16px',
        objectFit: 'contain'
      }}
    />
  );

  // 지브리파크 아이콘 (먼지 이미지)
  const GhibliParkIcon = () => (
    <img
      src="/internet/ghibli/먼지들.png"
      alt="ジブリパーク"
      style={{
        width: '16px',
        height: '16px',
        objectFit: 'contain',
        objectPosition: '0 0'
      }}
    />
  );

  const quickLinks = [
    { name: 'Apple', url: 'apple.com', icon: AppleIcon },
    { name: 'Youngwon', url: 'youngwon.com', icon: YoungwonIcon },
    { name: 'Google', url: 'google.com', icon: GoogleIcon },
    { name: 'ジブリパーク', url: 'ghibli-park.jp', icon: GhibliParkIcon },
    { name: 'Man City', url: 'mancity.com', icon: ManCityIcon },
    { name: 'Netflix', url: 'netflix.com', icon: NetflixIcon }
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
          {/* Time Machine 연도 선택 (apple.com일 때만 표시) */}
          {currentUrl === 'apple.com' && (
            <div className={styles.timeMachineWrapper} ref={yearDropdownRef}>
              <button
                className={styles.yearSelectButton}
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              >
                <span>{selectedYear === 'current' ? '지금' : selectedYear}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {isYearDropdownOpen && (
                <div className={styles.yearDropdownMenu}>
                  <div className={styles.yearDropdownScrollArea}>
                    <div
                      className={`${styles.yearDropdownItem} ${selectedYear === 'current' ? styles.selected : ''}`}
                      onClick={() => {
                        setSelectedYear('current');
                        setIsYearDropdownOpen(false);
                      }}
                    >
                      <span>지금</span>
                      {selectedYear === 'current' && <span className={styles.checkmark}>✓</span>}
                    </div>
                    {Object.keys(appleTimeMachineData).reverse().map((year) => (
                      <div
                        key={year}
                        className={`${styles.yearDropdownItem} ${selectedYear === parseInt(year) ? styles.selected : ''}`}
                        onClick={() => {
                          setSelectedYear(parseInt(year));
                          setIsYearDropdownOpen(false);
                        }}
                      >
                        <span>{year}</span>
                        {selectedYear === parseInt(year) && <span className={styles.checkmark}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
              src="/internet/youngwon/영원로고.png"
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
      <div className={styles.content} ref={contentRef}>
        {currentUrl === 'youngwon.com' ? (
          <div className={styles.youngwonPage}>
            {/* 숲속 이미지 */}
            <div className={styles.forestImageContainer}>
              <img
                src="/internet/youngwon/숲속이미지.jpeg"
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
                  ref={carouselTrackRef}
                  className={styles.carouselTrack}
                  style={{
                    transform: `translateX(calc(${-displayIndex * 85}% - ${displayIndex * 20}px + 7.5%))`,
                    transition: (isDragging || isTransitioning) ? 'none' : 'transform 0.3s ease'
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
                              onMouseDown={handleDragStart}
                              onTouchStart={handleDragStart}
                              style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
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
        ) : currentUrl === 'google.com' ? (
          googleSearchResults ? (
            /* 2010년 스타일 구글 검색 결과 페이지 */
            <div className={styles.google2010ResultsPage}>
              {/* 상단 헤더 */}
              <div className={styles.google2010ResultsHeader}>
                {/* 로고 */}
                <div
                  className={styles.google2010ResultsLogo}
                  onClick={() => {
                    setGoogleSearchResults(null);
                    setSearchQuery('');
                  }}
                >
                  <span className={styles.google2010LogoG}>G</span>
                  <span className={styles.google2010LogoO1}>o</span>
                  <span className={styles.google2010LogoO2}>o</span>
                  <span className={styles.google2010LogoG2}>g</span>
                  <span className={styles.google2010LogoL}>l</span>
                  <span className={styles.google2010LogoE}>e</span>
                </div>
                {/* 검색창 */}
                <form
                  className={styles.google2010ResultsSearchForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      const results = generateSearchResults(searchQuery);
                      setGoogleSearchResults({ query: searchQuery, results });
                    }
                  }}
                >
                  <input
                    type="text"
                    className={styles.google2010ResultsSearchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className={styles.google2010ResultsSearchBtn}>
                    Search
                  </button>
                </form>
                {/* 우측 링크 */}
                <div className={styles.google2010ResultsHeaderRight}>
                  <a href="#" className={styles.google2010NavLink}>Web History</a>
                  <span className={styles.google2010Separator}>|</span>
                  <a href="#" className={styles.google2010NavLink}>Settings</a>
                  <span className={styles.google2010Separator}>|</span>
                  <a href="#" className={styles.google2010NavLink}>Sign in</a>
                </div>
              </div>

              {/* 상단 탭 */}
              <div className={styles.google2010ResultsTabs}>
                <a href="#" className={`${styles.google2010ResultsTab} ${styles.active}`}>Web</a>
                <a href="#" className={styles.google2010ResultsTab}>Images</a>
                <a href="#" className={styles.google2010ResultsTab}>Videos</a>
                <a href="#" className={styles.google2010ResultsTab}>Maps</a>
                <a href="#" className={styles.google2010ResultsTab}>News</a>
                <a href="#" className={styles.google2010ResultsTab}>Shopping</a>
                <a href="#" className={styles.google2010ResultsTab}>Gmail</a>
                <a href="#" className={styles.google2010ResultsTab}>more ▼</a>
              </div>

              {/* 메인 컨텐츠 */}
              <div className={styles.google2010ResultsContent}>
                {/* 좌측 사이드바 */}
                <div className={styles.google2010ResultsSidebar}>
                  <div className={styles.google2010ResultsStats}>
                    About {Math.floor(Math.random() * 900000000 + 100000000).toLocaleString()} results ({(Math.random() * 0.5 + 0.1).toFixed(2)} seconds)
                  </div>
                  <div className={styles.google2010ResultsFilters}>
                    <a href="#" className={`${styles.google2010FilterLink} ${styles.active}`}>Web</a>
                    <a href="#" className={styles.google2010FilterLink}>Images</a>
                    <a href="#" className={styles.google2010FilterLink}>Videos</a>
                    <a href="#" className={styles.google2010FilterLink}>Shopping</a>
                    <a href="#" className={styles.google2010FilterLink}>More</a>
                  </div>
                  <div className={styles.google2010ResultsDivider}></div>
                  <a href="#" className={styles.google2010SearchTools}>Show search tools</a>
                </div>

                {/* 검색 결과 목록 */}
                <div className={styles.google2010ResultsList}>
                  {googleSearchResults.results.map((result, index) => (
                    <div key={index} className={styles.google2010ResultItem}>
                      <a href="#" className={styles.google2010ResultTitle}>
                        {result.title}
                      </a>
                      <div className={styles.google2010ResultUrl}>
                        {result.url}
                      </div>
                      <div className={styles.google2010ResultDescription}>
                        {result.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 페이지네이션 */}
              <div className={styles.google2010ResultsPagination}>
                <div className={styles.google2010PaginationLogoRow}>
                  <span className={styles.google2010PaginationLogo}>
                    <span className={styles.google2010LogoG}>G</span>
                    <span className={styles.google2010LogoO1}>o</span>
                    <span className={styles.google2010LogoO2}>o</span>
                    <span className={styles.google2010LogoO1}>o</span>
                    <span className={styles.google2010LogoO2}>o</span>
                    <span className={styles.google2010LogoO1}>o</span>
                    <span className={styles.google2010LogoO2}>o</span>
                    <span className={styles.google2010LogoO1}>o</span>
                    <span className={styles.google2010LogoO2}>o</span>
                    <span className={styles.google2010LogoG2}>g</span>
                    <span className={styles.google2010LogoL}>l</span>
                    <span className={styles.google2010LogoE}>e</span>
                  </span>
                  <span className={styles.google2010PaginationArrow}>▶</span>
                </div>
                <div className={styles.google2010PaginationNumbers}>
                  <span className={styles.google2010PaginationCurrent}>1</span>
                  <a href="#" className={styles.google2010PaginationLink}>2</a>
                  <a href="#" className={styles.google2010PaginationLink}>3</a>
                  <a href="#" className={styles.google2010PaginationLink}>4</a>
                  <a href="#" className={styles.google2010PaginationLink}>5</a>
                  <a href="#" className={styles.google2010PaginationLink}>6</a>
                  <a href="#" className={styles.google2010PaginationLink}>7</a>
                  <a href="#" className={styles.google2010PaginationLink}>8</a>
                  <a href="#" className={styles.google2010PaginationLink}>9</a>
                  <a href="#" className={styles.google2010PaginationLink}>10</a>
                  <a href="#" className={styles.google2010PaginationNext}>Next</a>
                </div>
                <div className={styles.google2010PaginationHelp}>
                  <a href="#" className={styles.google2010HelpLink}>Search Help</a>
                  <a href="#" className={styles.google2010HelpLink}>Give us feedback</a>
                </div>
              </div>

              {/* 검색 결과 푸터 */}
              <div className={styles.google2010ResultsFooter}>
                <div className={styles.google2010ResultsFooterLinks}>
                  <a href="#" className={styles.google2010FooterLink}>Google Home</a>
                  <a href="#" className={styles.google2010FooterLink}>Advertising Programs</a>
                  <a href="#" className={styles.google2010FooterLink}>Business Solutions</a>
                  <a href="#" className={styles.google2010FooterLink}>Privacy & Terms</a>
                </div>
                <div className={styles.google2010ResultsFooterLinks}>
                  <a href="#" className={styles.google2010FooterLink}>About Google</a>
                </div>
              </div>
            </div>
          ) : (
            /* 2010년 스타일 구글 홈페이지 */
            <div className={styles.google2010Page}>
              {/* 상단 네비게이션 */}
              <div className={styles.google2010TopNav}>
                <div className={styles.google2010NavLinks}>
                  <a href="#" className={`${styles.google2010NavLink} ${styles.active}`}>Web</a>
                  <a href="#" className={styles.google2010NavLink}>Images</a>
                  <a href="#" className={styles.google2010NavLink}>Videos</a>
                  <a href="#" className={styles.google2010NavLink}>Maps</a>
                  <a href="#" className={styles.google2010NavLink}>News</a>
                  <a href="#" className={styles.google2010NavLink}>Shopping</a>
                  <a href="#" className={styles.google2010NavLink}>Gmail</a>
                  <a href="#" className={styles.google2010NavLink}>more ▼</a>
                </div>
                <div className={styles.google2010TopRight}>
                  <a href="#" className={styles.google2010NavLink}>iGoogle</a>
                  <span className={styles.google2010Separator}>|</span>
                  <a href="#" className={styles.google2010NavLink}>Search settings</a>
                  <span className={styles.google2010Separator}>|</span>
                  <a href="#" className={styles.google2010NavLink}>Sign in</a>
                </div>
              </div>

              {/* 메인 컨텐츠 */}
              <div className={styles.google2010Main}>
                {/* 구글 로고 */}
                <div className={styles.google2010Logo}>
                  <span className={styles.google2010LogoG}>G</span>
                  <span className={styles.google2010LogoO1}>o</span>
                  <span className={styles.google2010LogoO2}>o</span>
                  <span className={styles.google2010LogoG2}>g</span>
                  <span className={styles.google2010LogoL}>l</span>
                  <span className={styles.google2010LogoE}>e</span>
                </div>

                {/* 검색 폼 */}
                <form
                  className={styles.google2010SearchForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      const results = generateSearchResults(searchQuery);
                      setGoogleSearchResults({ query: searchQuery, results });
                    }
                  }}
                >
                  <div className={styles.google2010SearchRow}>
                    <input
                      type="text"
                      className={styles.google2010SearchInput}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <div className={styles.google2010SearchSide}>
                      <a href="#" className={styles.google2010SideLink}>Advanced Search</a>
                      <a href="#" className={styles.google2010SideLink}>Language Tools</a>
                    </div>
                  </div>
                  <div className={styles.google2010SearchButtons}>
                    <button type="submit" className={styles.google2010SearchBtn}>
                      Google Search
                    </button>
                    <button
                      type="button"
                      className={styles.google2010SearchBtn}
                      onClick={() => {
                        if (searchQuery.trim()) {
                          window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&btnI=1`, '_blank');
                        }
                      }}
                    >
                      I'm Feeling Lucky
                    </button>
                  </div>
                </form>
              </div>

              {/* 하단 푸터 */}
              <div className={styles.google2010Footer}>
                <div className={styles.google2010FooterLinks}>
                  <a href="#" className={styles.google2010FooterLink}>Advertising Programs</a>
                  <span className={styles.google2010FooterSep}>-</span>
                  <a href="#" className={styles.google2010FooterLink}>Business Solutions</a>
                  <span className={styles.google2010FooterSep}>-</span>
                  <a href="#" className={styles.google2010FooterLink}>About Google</a>
                </div>
                <div className={styles.google2010Copyright}>
                  ©2010 - <a href="#" className={styles.google2010FooterLink}>Privacy</a>
                </div>
              </div>
            </div>
          )
        ) : currentUrl === 'apple.com' ? (
          /* 애플 Time Machine 페이지 - Wayback Machine iframe */
          <div className={styles.appleTimeMachinePage}>
            <div className={styles.waybackContainer}>
              {isWaybackLoading && (
                <div className={styles.waybackLoading}>
                  <div className={styles.loadingSpinner}></div>
                  <span>Loading {selectedYear === 'current' ? '최신' : selectedYear} Apple.com...</span>
                </div>
              )}
              <iframe
                className={styles.waybackIframe}
                src={
                  selectedYear === 'current'
                    ? 'https://web.archive.org/web/https://www.apple.com/'
                    : `https://web.archive.org/web/${appleTimeMachineData[selectedYear]}/https://www.apple.com/`
                }
                title={`Apple.com - ${selectedYear === 'current' ? '최신' : selectedYear}`}
                referrerPolicy="no-referrer"
                onLoad={() => setIsWaybackLoading(false)}
                style={{ opacity: isWaybackLoading ? 0 : 1 }}
              />
            </div>
          </div>
        ) : currentUrl === 'netflix.com' ? (
          /* 넷플릭스 페이지 - 빈 화면 */
          <div className={styles.netflixPage}>
            {/* 나중에 구성 예정 */}
          </div>
        ) : currentUrl === 'mancity.com' ? (
          /* 맨시티 페이지 */
          <div className={styles.mancityPage}>
            {/* 상단 네비게이션 바 */}
            <div className={styles.mancityNavBar}>
              <div className={styles.mancityNavLeft}>
                <img
                  src="/internet/mancity/city logo.svg"
                  alt="Manchester City"
                  className={styles.mancityLogo}
                  onClick={() => {
                    if (contentRef.current) {
                      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <nav className={styles.mancityNav}>
                  <button
                    className={styles.mancityNavItem}
                    onClick={() => {
                      if (contentRef.current) {
                        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >News</button>
                  <button
                    className={styles.mancityNavItem}
                    onClick={() => {
                      if (mancityVideoSectionRef.current) {
                        mancityVideoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >Video</button>
                  <button
                    className={styles.mancityNavItem}
                    onClick={() => {
                      if (mancityShopSectionRef.current) {
                        mancityShopSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >Shop</button>
                  <button className={styles.mancityNavItem}>Players</button>
                  <button className={styles.mancityNavItem}>Tickets</button>
                  <button className={styles.mancityNavItem}>More</button>
                </nav>
              </div>
              <div className={styles.mancityNavRight}>
                <button className={styles.mancityLangButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span>EN</span>
                </button>
                <button className={styles.mancitySearchButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button className={styles.mancitySignInButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Sign in</span>
                </button>
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className={styles.mancityContent}>
              {/* 히어로 섹션 */}
              <div className={styles.mancityHero}>
                <div className={styles.mancityHeroContent}>
                  <span className={styles.mancityHeroLabel}>MEN'S TEAM</span>
                  <h1 className={styles.mancityHeroTitle}>Man City win Champions League and Treble</h1>
                </div>
                <div className={styles.mancityHeroImage}>
                  <img src="/internet/mancity/시티챔스우승.webp" alt="Man City Champions" />
                </div>
              </div>

              {/* 뉴스 기사 섹션 */}
              <div className={styles.mancityNewsSection}>
                <div className={styles.mancityNewsCard}>
                  <div className={styles.mancityNewsImage}>
                    <img src="/internet/mancity/덕배시티고별식.webp" alt="Kevin de Bruyne" style={{ objectPosition: 'center 20%' }} />
                  </div>
                  <h3 className={styles.mancityNewsTitle}>Kevin de Bruyne announces Man City exit - 10-year ride</h3>
                  <span className={styles.mancityNewsLabel}>MEN'S TEAM</span>
                </div>
                <div className={styles.mancityNewsCard}>
                  <div className={styles.mancityNewsImage}>
                    <img src="/internet/mancity/팹인터뷰.webp" alt="Pep Guardiola" />
                  </div>
                  <h3 className={styles.mancityNewsTitle}>Pep Guardiola contract: Man City boss extends deal until 2027</h3>
                  <span className={styles.mancityNewsLabel}>MEN'S TEAM</span>
                </div>
                <div className={styles.mancityNewsCard}>
                  <div className={styles.mancityNewsImage}>
                    <img src="/internet/mancity/홀란.webp" alt="Erling Haaland" />
                  </div>
                  <h3 className={styles.mancityNewsTitle}>Here To Stay: Haaland signs new 10-year City contract!</h3>
                  <span className={styles.mancityNewsLabel}>MEN'S TEAM</span>
                </div>
              </div>

              {/* 비디오 섹션 */}
              <div className={styles.mancityVideoSection} ref={mancityVideoSectionRef}>
                <div className={styles.mancityVideoContent}>
                  <span className={styles.mancityVideoLabel}>MEN'S TEAM</span>
                  <h2 className={styles.mancityVideoTitle}>Rodri strike gives Man City victory in Champions League final</h2>
                  <div
                    className={styles.mancityPlayButton}
                    onClick={() => {
                      if (mancityVideoRef.current) {
                        mancityVideoRef.current.play();
                      }
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.mancityVideoPlayer}>
                  <video
                    ref={mancityVideoRef}
                    src="/internet/mancity/로드리결승골.mp4"
                    controls
                    poster="/internet/mancity/시티챔스우승.webp"
                  />
                </div>
              </div>

              {/* Shop 섹션 */}
              <div className={styles.mancityShopSection} ref={mancityShopSectionRef}>
                {/* 상단 배너 */}
                <div className={styles.mancityShopBanner}>
                  <span>50% OFF OUR 2025/26 HOME KIT</span>
                </div>
                {/* 메인 이미지 영역 */}
                <div className={styles.mancityShopHero}>
                  <img src="/internet/mancity/시티shop.png" alt="Manchester City 2025/26 Home Kit" />
                </div>
                {/* 하단 텍스트 영역 */}
                <div className={styles.mancityShopInfo}>
                  <h2 className={styles.mancityShopTitle}>
                    OUR 2025/26 HOME KIT<br />- 50% OFF
                  </h2>
                  <p className={styles.mancityShopDescription}>
                    Paired with the unmistakable Sky Blue and reimagined for the next generation.
                  </p>
                  <button className={styles.mancityShopButton}>SHOP NOW</button>
                </div>
              </div>

              {/* 푸터 */}
              <footer className={styles.mancityFooter}>
                <div className={styles.mancityFooterTop}>
                  <div className={styles.mancityFooterLogo}>
                    <img src="/internet/mancity/city logo.svg" alt="Manchester City" />
                  </div>
                  <div className={styles.mancityFooterSocial}>
                    <button className={styles.mancitySocialButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </button>
                    <button className={styles.mancitySocialButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </button>
                    <button className={styles.mancitySocialButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    <button className={styles.mancitySocialButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className={styles.mancitySocialButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.mancityFooterLinks}>
                  <span>FAQ & CONTACT</span>
                  <span>DELIVERY & SHIPPING</span>
                  <span>RETURNS</span>
                  <span>TRACK MY ORDER</span>
                  <span>GIFT CARDS</span>
                </div>

                <div className={styles.mancityFooterSecondary}>
                  <span>Live Chat</span>
                  <span>Terms & Conditions</span>
                  <span>Privacy policy</span>
                  <span>Cookie policy</span>
                  <span>About us</span>
                  <span>ManCity.com</span>
                </div>

                <div className={styles.mancityFooterBottom}>
                  <span className={styles.mancityCopyright}>© 2025 stichd Sportmerchandising bv</span>
                </div>
              </footer>
            </div>
          </div>
        ) : currentUrl === 'ghibli-park.jp' ? (
          /* 지브리파크 페이지 */
          <div className={styles.ghibliParkPage}>
            {/* 상단 네비게이션 바 */}
            <div className={styles.ghibliNavBar}>
              <button className={styles.ghibliMenuButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className={styles.ghibliGlobeButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>

            {/* 히어로 섹션 (배경 이미지) */}
            <div className={styles.ghibliHeroSection}>
              <img src="/internet/ghibli/ghibli-park.jpg" alt="Ghibli Park" className={styles.ghibliBackgroundImage} />

              {/* 먼지 캐릭터 1 + 말풍선 (Tickets) - 왼쪽 위 */}
              <div className={`${styles.ghibliSootSprite} ${styles.ghibliSootSprite1}`} style={{ top: '18%', left: '15%' }} />
              <div className={styles.ghibliBubble} style={{ top: '5%', left: '18%' }}>
                <span>Tickets</span>
              </div>

              {/* 먼지 캐릭터 2 + 말풍선 (What's New) - 오른쪽 위 */}
              <div className={`${styles.ghibliSootSprite} ${styles.ghibliSootSprite2}`} style={{ top: '22%', right: '15%' }} />
              <div className={`${styles.ghibliBubble} ${styles.ghibliBubbleRight}`} style={{ top: '8%', right: '18%' }}>
                <span>What's<br/>New</span>
              </div>

              {/* 먼지 캐릭터 3 + 말풍선 (Directions) - 오른쪽 중간 */}
              <div className={`${styles.ghibliSootSprite} ${styles.ghibliSootSprite3}`} style={{ top: '55%', right: '18%' }} />
              <div className={`${styles.ghibliBubble} ${styles.ghibliBubbleRight}`} style={{ top: '42%', right: '20%' }}>
                <span>Directions</span>
              </div>

              {/* 하단 로고 */}
              <div className={styles.ghibliLogoContainer}>
                <div className={styles.ghibliLogoJapanese}>
                  <img src="/internet/ghibli/ghibli-logo.svg" alt="ジブリパーク" />
                </div>
                <div className={styles.ghibliLogoEnglish}>GHIBLI PARK</div>
              </div>
            </div>

            {/* 맵 섹션 */}
            <div className={styles.ghibliMapSection}>
              <h2 className={styles.ghibliMapTitle}>PARK MAP</h2>
              <img src="/internet/ghibli/ghibli-map.webp" alt="Ghibli Park Map" className={styles.ghibliMapImage} />
            </div>

            {/* 푸터 */}
            <div className={styles.ghibliFooter}>
              <div className={styles.ghibliFooterContent}>
                <div className={styles.ghibliFooterColumn}>
                  <ul>
                    <li>TOP</li>
                    <li>What's New</li>
                    <li className={styles.indented}>Wait Times (Operation Status) for Facilities</li>
                    <li>Ticket Options and Prices</li>
                    <li>Calendar</li>
                    <li>Directions</li>
                  </ul>
                </div>
                <div className={styles.ghibliFooterColumn}>
                  <ul>
                    <li>What is Ghibli Park?</li>
                    <li>Ghibli's Grand Warehouse</li>
                    <li>Hill of Youth</li>
                    <li>Dondoko Forest</li>
                    <li>Mononoke Village</li>
                    <li>Valley of Witches</li>
                  </ul>
                </div>
                <div className={styles.ghibliFooterColumn}>
                  <ul>
                    <li>Shops</li>
                    <li>Food</li>
                    <li className={styles.indented}>Transcontinental Flight Café</li>
                    <li className={styles.indented}>Flying OVEN</li>
                    <li className={styles.indented}>Main Menu / Stall Menu / Breakfast Menu</li>
                    <li className={styles.indented}>Hotdog Stand "Hot Tin Roof" Menu</li>
                    <li>Ghibli in the Park</li>
                    <li>Rotunda Kazegaoka</li>
                  </ul>
                </div>
                <div className={styles.ghibliFooterColumn}>
                  <ul>
                    <li>Expo 2005 Aichi Commemorative Park</li>
                    <li>FAQs</li>
                    <li>Official Partners</li>
                  </ul>
                  <h4 style={{ marginTop: '20px' }}>Related Links</h4>
                  <ul>
                    <li>Ghibli Museum, Mitaka in Japan</li>
                  </ul>
                </div>
              </div>
              <div className={styles.ghibliFooterBottom}>
                <div className={styles.ghibliFooterPolicy}>| Site policy |</div>
                <div className={styles.ghibliFooterCopyright}>
                  © 2026 GHIBLI PARK Co., Ltd. All Rights Reserved.<br/>
                  © 2026 Studio Ghibli
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
