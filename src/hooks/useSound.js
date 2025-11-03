import { useCallback } from 'react';

/**
 * 사운드 재생을 위한 커스텀 훅
 * @param {number} volume - 볼륨 (0.0 ~ 1.0, 기본값: 0.3)
 * @returns {Function} playSound - 사운드 파일을 재생하는 함수
 */
export const useSound = (volume = 0.3) => {
  const playSound = useCallback((soundFile) => {
    try {
      const audio = new Audio(`/sounds/ryos/${soundFile}`);
      audio.volume = volume;
      audio.play().catch(e => console.log('사운드 재생 실패:', e));
    } catch (error) {
      console.log('사운드 로드 실패:', error);
    }
  }, [volume]);

  return { playSound };
};

