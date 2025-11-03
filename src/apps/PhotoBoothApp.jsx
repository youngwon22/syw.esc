import React, { useState, useRef, useEffect } from 'react';
import styles from './PhotoBoothApp.module.css';

const PhotoBoothApp = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setIsLoading(true);
      console.log('카메라 시작 요청...');
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('카메라 스트림 획득 성공:', stream);
      streamRef.current = stream;
      
      setIsStreaming(true);
      setIsLoading(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('비디오 메타데이터 로드됨');
          videoRef.current.play().catch(e => console.error('비디오 재생 실패:', e));
        };
        
        videoRef.current.oncanplay = () => {
          console.log('비디오 재생 준비됨');
          setIsStreaming(true);
          setIsLoading(false);
        };
        
        videoRef.current.onplaying = () => {
          console.log('비디오 재생 중');
          setIsStreaming(true);
          setIsLoading(false);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('비디오 에러:', e);
          setError('비디오 재생 중 오류가 발생했습니다.');
          setIsLoading(false);
        };
        
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            console.log('비디오 재생 시도...');
            videoRef.current.play().catch(e => console.error('비디오 재생 실패:', e));
          }
        }, 100);
        
        setTimeout(() => {
          if (videoRef.current && !isStreaming) {
            console.log('지연된 비디오 재생 시도...');
            videoRef.current.play().catch(e => console.error('지연된 비디오 재생 실패:', e));
          }
        }, 1000);
        
        setTimeout(() => {
          if (videoRef.current && videoRef.current.srcObject && !isStreaming) {
            console.log('강제로 스트리밍 상태 활성화...');
            setIsStreaming(true);
            setIsLoading(false);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsLoading(false);
      if (err.name === 'NotAllowedError') {
        setError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else if (err.name === 'NotFoundError') {
        setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
      } else if (err.name === 'NotReadableError') {
        setError('카메라가 다른 애플리케이션에서 사용 중입니다.');
      } else {
        setError('카메라에 접근할 수 없습니다: ' + err.message);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    const timestamp = new Date().toLocaleString();
    
    const newPhoto = {
      id: Date.now(),
      data: imageData,
      timestamp: timestamp
    };
    
    setCapturedPhotos(prev => [...prev, newPhoto]);
    
    // 자동으로 다운로드
    const link = document.createElement('a');
    link.download = `photo_${Date.now()}.png`;
    link.href = imageData;
    link.click();
  };

  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.download = `photo_${photo.id}.png`;
    link.href = photo.data;
    link.click();
  };

  return (
    <div className={styles.photoBoothApp}>
      <div className={styles.contentArea}>
        {isLoading && (
          <div className={styles.loadingScreen}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <p>카메라 연결 중...</p>
            </div>
          </div>
        )}
        
        {error && !isStreaming && (
          <div className={styles.blackScreen}>
            <div className={styles.blackScreenContent}>
              <p>카메라 연결 실패</p>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className={styles.videoStream}
          style={{ display: isStreaming ? 'block' : 'none' }}
          autoPlay
          playsInline
          webkit-playsinline="true"
        />
        
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
      
      <div className={styles.toolbar}>
        <button 
          className={styles.galleryButton}
          onClick={toggleGallery}
          title="갤러리"
        >
          <img src="/icon/사진.png" alt="갤러리" className={styles.galleryIcon} />
        </button>
        
        <button 
          className={styles.captureButton}
          onClick={capturePhoto}
          disabled={!isStreaming}
          title="사진 촬영"
        >
        </button>
        
        <button 
          className={styles.effectButton}
          title="효과"
        >
          Effect
        </button>
      </div>
      
      {showGallery && (
        <div className={styles.galleryModal}>
          <div className={styles.galleryContent}>
            <div className={styles.galleryHeader}>
              <h3>촬영된 사진</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowGallery(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.galleryPhotos}>
              {capturedPhotos.length === 0 ? (
                <div className={styles.emptyGallery}>
                  <p>아직 촬영된 사진이 없습니다.</p>
                </div>
              ) : (
                capturedPhotos.map((photo) => (
                  <div key={photo.id} className={styles.galleryPhotoItem}>
                    <img 
                      src={photo.data} 
                      alt={`Photo ${photo.id}`}
                      className={styles.galleryPhotoThumbnail}
                    />
                    <div className={styles.galleryPhotoInfo}>
                      <p>{photo.timestamp}</p>
                      <button 
                        onClick={() => downloadPhoto(photo)}
                        className={styles.downloadButton}
                      >
                        다운로드
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoBoothApp;
