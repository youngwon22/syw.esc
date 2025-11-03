import React, { useState, useEffect } from 'react';
import styles from './AlbumApp.module.css';

function AlbumApp() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const albums = [
    {
      id: 1,
      title: 'Travel',
      cover: '🗼',
      color: '#FF6B6B',
      photos: [
        { id: 1, title: '파리 여행', date: '2023.06.15', image: '🗼' },
        { id: 2, title: '도쿄 여행', date: '2023.08.22', image: '🗾' },
        { id: 3, title: '제주도 여행', date: '2023.10.05', image: '🏝️' }
      ]
    },
    {
      id: 2,
      title: 'Friends',
      cover: '/앨범/freinds/고xx.JPG',
      color: '#4ECDC4',
      photos: [
        { id: 1, title: '고xx', date: '2023.05.20', image: '/앨범/freinds/고xx.JPG' },
        { id: 2, title: '공덕족발', date: '2023.07.12', image: '/앨범/freinds/공덕족발.JPG' },
        { id: 3, title: '그곳', date: '2023.09.18', image: '/앨범/freinds/그곳.jpeg' },
        { id: 4, title: '그녀석', date: '2023.10.15', image: '/앨범/freinds/그녀석.jpeg' },
        { id: 5, title: '김xx', date: '2023.10.22', image: '/앨범/freinds/김xx.JPG' },
        { id: 6, title: '똥', date: '2023.11.05', image: '/앨범/freinds/똥.jpeg' },
        { id: 7, title: '류xx', date: '2023.11.12', image: '/앨범/freinds/류xx.jpeg' },
        { id: 8, title: '메이플월드', date: '2023.11.18', image: '/앨범/freinds/메이플월드.JPG' },
        { id: 9, title: '박xx', date: '2023.11.25', image: '/앨범/freinds/박xx.jpeg' },
        { id: 10, title: '비상대책위원회', date: '2023.12.02', image: '/앨범/freinds/비상대책위원회.jpeg' },
        { id: 11, title: '사캠', date: '2023.12.10', image: '/앨범/freinds/사캠.JPG' },
        { id: 12, title: '사켐', date: '2023.12.15', image: '/앨범/freinds/사켐.jpeg' },
        { id: 13, title: '성공', date: '2023.12.20', image: '/앨범/freinds/성공.JPG' },
        { id: 14, title: '에이전트 김', date: '2023.12.25', image: '/앨범/freinds/에이전트 김.jpeg' },
        { id: 15, title: '이xx', date: '2023.12.30', image: '/앨범/freinds/이xx.jpeg' }
      ]
    },
    {
      id: 3,
      title: '일상',
      cover: '📸',
      color: '#96CEB4',
      photos: [
        { id: 1, title: '카페에서', date: '2023.11.03', image: '☕' },
        { id: 2, title: '산책길', date: '2023.11.01', image: '🌳' },
        { id: 3, title: '집에서', date: '2023.10.28', image: '🏠' }
      ]
    },
    {
      id: 4,
      title: '잘 먹겠습니다!',
      cover: '/앨범/잘먹겠습니다/IMG_0106.jpeg',
      color: '#F39C12',
      photos: [
        { id: 1, title: 'IMG_0106', date: '2023.01.06', image: '/앨범/잘먹겠습니다/IMG_0106.jpeg' },
        { id: 2, title: 'IMG_0212', date: '2023.02.12', image: '/앨범/잘먹겠습니다/IMG_0212.jpeg' },
        { id: 3, title: 'IMG_0215', date: '2023.02.15', image: '/앨범/잘먹겠습니다/IMG_0215.jpeg' },
        { id: 4, title: 'IMG_0242', date: '2023.02.42', image: '/앨범/잘먹겠습니다/IMG_0242.jpeg' },
        { id: 5, title: 'IMG_0318', date: '2023.03.18', image: '/앨범/잘먹겠습니다/IMG_0318.jpeg' },
        { id: 6, title: 'IMG_0505', date: '2023.05.05', image: '/앨범/잘먹겠습니다/IMG_0505.jpeg' },
        { id: 7, title: 'IMG_0519', date: '2023.05.19', image: '/앨범/잘먹겠습니다/IMG_0519.jpeg' },
        { id: 8, title: 'IMG_0537', date: '2023.05.37', image: '/앨범/잘먹겠습니다/IMG_0537.jpeg' },
        { id: 9, title: 'IMG_0592', date: '2023.05.92', image: '/앨범/잘먹겠습니다/IMG_0592.JPG' },
        { id: 10, title: 'IMG_0680', date: '2023.06.80', image: '/앨범/잘먹겠습니다/IMG_0680.jpeg' },
        { id: 11, title: 'IMG_0854', date: '2023.08.54', image: '/앨범/잘먹겠습니다/IMG_0854.jpeg' },
        { id: 12, title: 'IMG_0945', date: '2023.09.45', image: '/앨범/잘먹겠습니다/IMG_0945.jpeg' },
        { id: 13, title: 'IMG_0958', date: '2023.09.58', image: '/앨범/잘먹겠습니다/IMG_0958.jpeg' },
        { id: 14, title: 'IMG_1115', date: '2023.11.15', image: '/앨범/잘먹겠습니다/IMG_1115.jpeg' },
        { id: 15, title: 'IMG_1122', date: '2023.11.22', image: '/앨범/잘먹겠습니다/IMG_1122.jpeg' },
        { id: 16, title: 'IMG_1271', date: '2023.12.71', image: '/앨범/잘먹겠습니다/IMG_1271.jpeg' }
      ]
    },
    {
      id: 5,
      title: 'Family',
      cover: '👨‍👩‍👧‍👦',
      color: '#45B7D1',
      photos: [
        { id: 1, title: '가족 여행', date: '2023.04.10', image: '🏖️' },
        { id: 2, title: '생일 파티', date: '2023.03.11', image: '🎂' },
        { id: 3, title: '명절 모임', date: '2023.09.29', image: '🌕' }
      ]
    }
  ];

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
  };

  const handleBackClick = () => {
    setSelectedAlbum(null);
  };

  const handleForwardClick = () => {
    // 앞으로가기 기능 (현재는 빈 함수)
    console.log('Forward clicked');
  };

  // 사진들을 시간순으로 정렬하는 함수
  const sortPhotos = (photos, order) => {
    return [...photos].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  // 정렬 순서 토글 함수
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // 사진 클릭 핸들러
  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedPhoto(null);
    setCurrentPhotoIndex(0);
  };

  // 다음 사진으로 이동
  const nextPhoto = () => {
    const sortedPhotos = sortPhotos(selectedAlbum.photos, sortOrder);
    const nextIndex = (currentPhotoIndex + 1) % sortedPhotos.length;
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(sortedPhotos[nextIndex]);
  };

  // 이전 사진으로 이동
  const prevPhoto = () => {
    const sortedPhotos = sortPhotos(selectedAlbum.photos, sortOrder);
    const prevIndex = currentPhotoIndex === 0 ? sortedPhotos.length - 1 : currentPhotoIndex - 1;
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(sortedPhotos[prevIndex]);
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (selectedPhoto) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        prevPhoto();
      }
    }
  };

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto, currentPhotoIndex, selectedAlbum, sortOrder]);


  if (selectedAlbum) {
    return (
      <div className={styles.albumApp}>
        <div className={styles.navigationBar}>
          <button className={styles.navButton} onClick={handleBackClick}>
            ←
          </button>
          <button className={styles.navButton} onClick={handleForwardClick}>
            →
          </button>
          <button className={styles.sortButton} onClick={toggleSortOrder}>
            {sortOrder === 'newest' ? '최신순' : '오래된순'}
          </button>
        </div>
        <div className={styles.photoGrid}>
          {sortPhotos(selectedAlbum.photos, sortOrder).map((photo, index) => (
            <div 
              key={photo.id} 
              className={styles.photoItem}
              onClick={() => handlePhotoClick(photo, index)}
            >
              <div className={styles.photoImage}>
                {photo.image.startsWith('/') ? (
                  <img src={photo.image} alt={photo.title} className={styles.photoImg} />
                ) : (
                  photo.image
                )}
              </div>
              <div className={styles.photoTitle}>{photo.title}</div>
              <div className={styles.photoDate}>{photo.date}</div>
            </div>
          ))}
        </div>

        {/* 사진 모달 */}
        {selectedPhoto && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
              <button className={styles.prevButton} onClick={prevPhoto}>‹</button>
              <button className={styles.nextButton} onClick={nextPhoto}>›</button>
              <div className={styles.modalImage}>
                {selectedPhoto.image.startsWith('/') ? (
                  <img src={selectedPhoto.image} alt={selectedPhoto.title} className={styles.modalImg} />
                ) : (
                  <div className={styles.modalEmoji}>{selectedPhoto.image}</div>
                )}
              </div>
              <div className={styles.modalInfo}>
                <h3 className={styles.modalTitle}>{selectedPhoto.title}</h3>
                <p className={styles.modalDate}>{selectedPhoto.date}</p>
                <p className={styles.modalCounter}>
                  {currentPhotoIndex + 1} / {sortPhotos(selectedAlbum.photos, sortOrder).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.albumApp}>
      <div className={styles.navigationBar}>
        <h1 className={styles.title}>My Albums</h1>
      </div>
      <div className={styles.bookshelf}>
        {albums.map(album => (
          <div 
            key={album.id} 
            className={styles.album}
            onClick={() => handleAlbumClick(album)}
            style={{ '--album-color': album.color }}
          >
            <div className={styles.albumCover}>
              {album.cover.startsWith('/') ? (
                <img src={album.cover} alt={album.title} className={styles.albumCoverImg} />
              ) : (
                <div className={styles.albumIcon}>{album.cover}</div>
              )}
            </div>
            <div className={styles.albumTitle}>{album.title}</div>
          </div>
        ))}
        {/* 빈 공간 1개 */}
        <div className={styles.emptySlot}></div>
      </div>
    </div>
  );
}

export default AlbumApp;
