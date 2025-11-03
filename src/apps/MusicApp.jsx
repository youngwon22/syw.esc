import React, { useState, useEffect, useRef } from 'react';
import styles from './MusicApp.module.css';

function MusicApp() {
  const [playlist, setPlaylist] = useState([
    { id: 1, videoId: 'SIuF37EWaLU', title: '東京フラッシュ', artist: 'Vaundy' },
    { id: 2, videoId: 's984zMNLL2o', title: 'シャッター', artist: '優里' },
    { id: 3, videoId: 'm0HU1RSNQZU', title: '恋風邪にのせて', artist: 'Vaundy' },
    { id: 4, videoId: 'LmZD-TU96q4', title: 'IRIS OUT', artist: '米津玄師' },
    { id: 5, videoId: 'sPLqsLsooJY', title: 'JANE DOE', artist: '米津玄師, 宇多田ヒカル' },
    { id: 6, videoId: 'oZpYEEcvu5I', title: '晩餐歌', artist: 'tuki' },
    { id: 7, videoId: '1lYb9nLO_FY', title: 'フィナーレ', artist: 'eill' },
    { id: 8, videoId: 'roqjNOlVaes', title: 'Shout Baby', artist: '緑黄色社会' },
    { id: 9, videoId: 'DuMqFknYHBs', title: 'イエスタデイ', artist: 'Official髭男dism' },
    { id: 10, videoId: 'WXS-o57VJ5w', title: 'GO!', artist: '코르티스' },
    { id: 11, videoId: '42wfEs7oIP8', title: 'FaSHioN', artist: '코르티스' },
    { id: 12, videoId: '5_n6t9G2TUQ', title: 'To. X', artist: '태연' },
    { id: 13, videoId: 'bNKXxwOQYB8', title: 'EASY', artist: 'LE SSERAFIM' },
    { id: 14, videoId: 'VjvzYjU1mY0', title: 'FAMOUS', artist: 'ALLDAY PROJECT' },
    { id: 15, videoId: 'u8mH-WHQdb0', title: 'BIG BIRD', artist: 'O3ohn X Car, the garden' },
    { id: 16, videoId: 'Km71Rr9K-Bw', title: 'Ditto', artist: 'NewJeans' }
  ]);
  
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // YouTube IFrame API 로드
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  
  // 플레이어 초기화
  const initializePlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '200',
      width: '100%',
      videoId: playlist[currentSong].videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  };

  // 플레이어 준비 완료
  const onPlayerReady = (event) => {
    event.target.setVolume(volume);
    updateProgress();
  };

  // 플레이어 상태 변경
  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressUpdate();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopProgressUpdate();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopProgressUpdate();
      playNext();
    }
  };

  // 프로그레스 업데이트 시작
  const startProgressUpdate = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(updateProgress, 500);
  };

  // 프로그레스 업데이트 중지
  const stopProgressUpdate = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // 프로그레스 업데이트
  const updateProgress = () => {
    if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
      const current = playerRef.current.getCurrentTime();
      const total = playerRef.current.getDuration();
      
      if (total > 0) {
        setCurrentTime(current);
        setDuration(total);
        setProgress((current / total) * 100);
      }
    }
  };

  // 재생/일시정지
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  // 이전 곡
  const playPrevious = () => {
    const prevIndex = currentSong > 0 ? currentSong - 1 : playlist.length - 1;
    setCurrentSong(prevIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(playlist[prevIndex].videoId);
    }
  };

  // 다음 곡
  const playNext = () => {
    const nextIndex = currentSong < playlist.length - 1 ? currentSong + 1 : 0;
    setCurrentSong(nextIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(playlist[nextIndex].videoId);
    }
  };

  // 특정 곡 재생
  const playSong = (index) => {
    setCurrentSong(index);
    if (playerRef.current) {
      playerRef.current.loadVideoById(playlist[index].videoId);
    }
  };

  // 프로그레스 바 클릭 (Seek)
  const handleProgressClick = (e) => {
    if (playerRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    }
  };

  // 볼륨 조절
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.musicApp}>
      {/* YouTube Player */}
      <div className={styles.playerContainer}>
        <div id="youtube-player"></div>
      </div>

      {/* 현재 재생 정보 */}
      <div className={styles.currentSong}>
        <h3 className={styles.songTitle}>{playlist[currentSong].title}</h3>
        <p className={styles.artistName}>{playlist[currentSong].artist}</p>
      </div>

      {/* 프로그레스 바 */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} onClick={handleProgressClick}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className={styles.timeContainer}>
          <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
          <span className={styles.timeDisplay}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={playPrevious}>
          ⏮
        </button>
        <button className={styles.playPauseBtn} onClick={togglePlayPause}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className={styles.controlBtn} onClick={playNext}>
          ⏭
        </button>
      </div>

      {/* 볼륨 컨트롤 */}
      <div className={styles.volumeContainer}>
        <img 
          src="/icon/sound-off.png" 
          alt="Sound Off" 
          className={styles.volumeIcon}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
        />
        <img 
          src="/icon/sound-on.png" 
          alt="Sound On" 
          className={styles.volumeIcon}
        />
      </div>

      {/* 플레이리스트 */}
      <div className={styles.playlistContainer}>
        <h4 className={styles.playlistTitle}>Playlist</h4>
        <div className={styles.playlist}>
          {playlist.map((song, index) => (
            <div
              key={song.id}
              className={`${styles.playlistItem} ${index === currentSong ? styles.active : ''}`}
              onClick={() => playSong(index)}
            >
              <div className={styles.songInfo}>
                <span className={styles.songTitle}>{song.title}</span>
                <span className={styles.artistName}>{song.artist}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MusicApp;
