import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './DinoGameApp.module.css';

const DinoGameApp = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // ready, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [sprites, setSprites] = useState({});
  const [animationFrame, setAnimationFrame] = useState(0);

  // 게임 상태
  const gameStateRef = useRef({
    dino: {
      x: 50,
      y: 180,
      width: 40,
      height: 50,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      jumpPower: -15,
      gravity: 0.8,
      duckHeight: 25,
      animationState: 'stand' // stand, run, jump, duck
    },
    obstacles: [],
    birds: [],
    ground: {
      y: 240,
      height: 20
    },
    speed: 5,
    score: 0,
    lastObstacleTime: 0,
    lastBirdTime: 0,
    obstacleInterval: 2000,
    birdInterval: 3000
  });

  // 스프라이트 로드
  const loadSprites = useCallback(async () => {
    const spritePromises = {
      dinoStand: loadImage('/sprites/dino/dino-stand.png'),
      dinoRun1: loadImage('/sprites/dino/dino-run-1.png'),
      dinoRun2: loadImage('/sprites/dino/dino-run-2.png'),
      dinoJump: loadImage('/sprites/dino/dino-jump.png'),
      dinoDuck: loadImage('/sprites/dino/dino-duck.png'),
      dinoCrouchRun1: loadImage('/sprites/dino/dino-crouch-run-1.png'),
      dinoCrouchRun2: loadImage('/sprites/dino/dino-crouch-run-2.png')
    };

    try {
      const loadedSprites = await Promise.all(Object.values(spritePromises));
      const spriteKeys = Object.keys(spritePromises);
      const spriteMap = {};
      
      spriteKeys.forEach((key, index) => {
        spriteMap[key] = loadedSprites[index];
      });
      
      setSprites(spriteMap);
      console.log('스프라이트 로드 성공:', spriteKeys);
    } catch (error) {
      console.error('스프라이트 로드 실패:', error);
      console.log('폴백 모드로 실행됩니다.');
      // 스프라이트 로드 실패해도 게임은 계속 실행
    }
  }, []);

  // 이미지 로드 헬퍼 함수
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // 게임 초기화
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 300;

    // 게임 상태 초기화
    gameStateRef.current = {
      dino: {
        x: 50,
        y: 180, // 키를 높임 (200 → 180)
        width: 40,
        height: 50, // 키를 높임 (40 → 50)
        velocityY: 0,
        isJumping: false,
        isDucking: false,
        jumpPower: -15,
        gravity: 0.8,
        duckHeight: 25 // 숙인 상태 높이도 조정 (20 → 25)
      },
      obstacles: [],
      birds: [],
      ground: {
        y: 240,
        height: 20
      },
      speed: 5,
      score: 0,
      lastObstacleTime: 0,
      lastBirdTime: 0,
      obstacleInterval: 2000,
      birdInterval: 3000
    };

    setScore(0);
    setGameState('ready');
  }, []);

  // 공룡 그리기 (스프라이트 기반)
  const drawDino = useCallback((ctx, dino) => {
    if (!sprites.dinoStand) {
      // 스프라이트가 로드되지 않았으면 기본 픽셀 그리기
      drawDinoFallback(ctx, dino);
      return;
    }

    let sprite;
    const { x, y, width, height, isDucking, isJumping, animationState } = dino;

    // 애니메이션 상태에 따라 스프라이트 선택
    if (isJumping) {
      sprite = sprites.dinoJump;
    } else if (isDucking) {
      // 숙인 상태에서 달리기 애니메이션
      if (gameState === 'playing') {
        sprite = animationFrame % 20 < 10 ? sprites.dinoCrouchRun1 : sprites.dinoCrouchRun2;
      } else {
        sprite = sprites.dinoDuck;
      }
    } else if (animationState === 'stand') {
      sprite = sprites.dinoStand;
    } else {
      // 달리기 애니메이션 (프레임 교체)
      sprite = animationFrame % 20 < 10 ? sprites.dinoRun1 : sprites.dinoRun2;
    }

    if (sprite) {
      // 스프라이트 그리기
      ctx.drawImage(sprite, x, y, width, height);
    }
  }, [sprites, animationFrame, gameState]);

  // 폴백 공룡 그리기 (스프라이트 로드 실패 시)
  const drawDinoFallback = useCallback((ctx, dino) => {
    const { x, y, width, height, isDucking } = dino;
    
    ctx.fillStyle = '#535353';
    
    if (isDucking) {
      // 숙인 상태
      ctx.fillRect(x + 2, y + height - 25, width - 4, 25);
      ctx.fillRect(x + 6, y + height - 37, 20, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 18, y + height - 33, 2, 2);
    } else {
      // 일반 상태
      ctx.fillRect(x + 2, y, width - 4, height);
      ctx.fillRect(x + 6, y - 12, 20, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 20, y - 6, 2, 2);
    }
  }, []);

  // 선인장 그리기 (구글 공룡 게임 스타일)
  const drawCactus = useCallback((ctx, cactus) => {
    ctx.fillStyle = '#535353';
    
    // 메인 선인장 몸체
    ctx.fillRect(cactus.x, cactus.y, cactus.width, cactus.height);
    
    // 선인장 가지들
    if (cactus.height > 30) {
      // 왼쪽 가지
      ctx.fillRect(cactus.x - 8, cactus.y + 10, 8, 12);
      // 오른쪽 가지
      ctx.fillRect(cactus.x + cactus.width, cactus.y + 15, 8, 10);
    }
    
    // 선인장 가시
    ctx.fillStyle = '#000';
    for (let i = 0; i < cactus.height; i += 8) {
      ctx.fillRect(cactus.x - 2, cactus.y + i, 2, 2);
      ctx.fillRect(cactus.x + cactus.width, cactus.y + i, 2, 2);
    }
  }, []);

  // 새 그리기 (구글 공룡 게임 스타일)
  const drawBird = useCallback((ctx, bird) => {
    ctx.fillStyle = '#535353';
    
    // 새 몸체 (더 크게)
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // 새 날개 (더 크게)
    ctx.fillRect(bird.x - 8, bird.y + 2, 12, 6);
    ctx.fillRect(bird.x + bird.width, bird.y + 2, 12, 6);
    
    // 새 부리
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.x - 5, bird.y + bird.height / 2, 8, 3);
    
    // 새 눈
    ctx.fillRect(bird.x + 3, bird.y + 3, 3, 3);
  }, []);

  // 배경 그리기
  const drawBackground = useCallback((ctx) => {
    // 하늘
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, 800, 300);
    
    // 땅
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, 240, 800, 20);
    
    // 구름
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.arc(150, 50, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(170, 50, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(190, 50, 20, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // 충돌 감지
  const checkCollision = useCallback((dino, obstacle) => {
    return dino.x < obstacle.x + obstacle.width &&
           dino.x + dino.width > obstacle.x &&
           dino.y < obstacle.y + obstacle.height &&
           dino.y + dino.height > obstacle.y;
  }, []);

  // 게임 루프
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const game = gameStateRef.current;

    if (gameState !== 'playing') return;

    // 화면 지우기
    ctx.clearRect(0, 0, 800, 300);

    // 배경 그리기
    drawBackground(ctx);

    // 공룡 물리
    game.dino.velocityY += game.dino.gravity;
    game.dino.y += game.dino.velocityY;

    // 땅에 착지
    if (game.dino.y >= game.ground.y - game.dino.height) {
      game.dino.y = game.ground.y - game.dino.height;
      game.dino.velocityY = 0;
      game.dino.isJumping = false;
    }

    // 공룡 애니메이션 상태 업데이트
    if (game.dino.isJumping) {
      game.dino.animationState = 'jump';
    } else if (game.dino.isDucking) {
      game.dino.animationState = 'duck';
    } else if (gameState === 'playing') {
      game.dino.animationState = 'run';
    } else {
      game.dino.animationState = 'stand';
    }

    // 애니메이션 프레임 업데이트
    setAnimationFrame(prev => prev + 1);

    // 공룡 그리기
    drawDino(ctx, game.dino);

    // 장애물 생성 (선인장)
    const now = Date.now();
    if (now - game.lastObstacleTime > game.obstacleInterval) {
      const cactusHeight = Math.random() > 0.5 ? 40 : 60; // 높이가 다른 선인장
      game.obstacles.push({
        x: 800,
        y: game.ground.y - cactusHeight,
        width: 20,
        height: cactusHeight,
        type: 'cactus'
      });
      game.lastObstacleTime = now;
    }

    // 새 장애물 생성
    if (now - game.lastBirdTime > game.birdInterval) {
      game.birds.push({
        x: 800,
        y: game.ground.y - 100 + Math.random() * 20, // 더 높은 위치, 공룡이 숙여서 피할 수 있도록
        width: 20,
        height: 15,
        type: 'bird'
      });
      game.lastBirdTime = now;
    }

    // 장애물 업데이트 및 그리기 (선인장)
    game.obstacles.forEach((obstacle, index) => {
      obstacle.x -= game.speed;
      drawCactus(ctx, obstacle);

      // 화면 밖으로 나간 장애물 제거
      if (obstacle.x + obstacle.width < 0) {
        game.obstacles.splice(index, 1);
        game.score += 10;
        setScore(game.score);
      }

      // 충돌 감지
      if (checkCollision(game.dino, obstacle)) {
        setGameState('gameOver');
        if (game.score > highScore) {
          setHighScore(game.score);
        }
        return;
      }
    });

    // 새 장애물 업데이트 및 그리기
    game.birds.forEach((bird, index) => {
      bird.x -= game.speed;
      drawBird(ctx, bird);

      // 화면 밖으로 나간 새 제거
      if (bird.x + bird.width < 0) {
        game.birds.splice(index, 1);
        game.score += 15; // 새는 더 높은 점수
        setScore(game.score);
      }

      // 충돌 감지 (새는 숙이기로 피할 수 있음)
      if (!game.dino.isDucking && checkCollision(game.dino, bird)) {
        setGameState('gameOver');
        if (game.score > highScore) {
          setHighScore(game.score);
        }
        return;
      }
    });

    // 속도 증가
    game.speed += 0.001;
    game.obstacleInterval = Math.max(1000, 2000 - game.score * 2);

  }, [gameState, highScore, drawBackground, drawDino, drawCactus, checkCollision]);

  // 키보드 이벤트
  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      
      if (gameState === 'ready') {
        setGameState('playing');
        return;
      }
      
      if (gameState === 'playing' && !gameStateRef.current.dino.isJumping) {
        gameStateRef.current.dino.velocityY = gameStateRef.current.dino.jumpPower;
        gameStateRef.current.dino.isJumping = true;
      }
      
      if (gameState === 'gameOver') {
        initGame();
      }
    }
    
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      
      if (gameState === 'playing') {
        gameStateRef.current.dino.isDucking = true;
      }
    }
  }, [gameState, initGame]);

  // 키보드 릴리즈 이벤트
  const handleKeyRelease = useCallback((e) => {
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      
      if (gameState === 'playing') {
        gameStateRef.current.dino.isDucking = false;
      }
    }
  }, [gameState]);

  // 게임 시작
  const startGame = useCallback(() => {
    setGameState('playing');
  }, []);

  // 게임 재시작
  const restartGame = useCallback(() => {
    initGame();
  }, [initGame]);

  // 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyRelease);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyRelease);
    };
  }, [handleKeyPress, handleKeyRelease]);

  // 게임 루프 시작
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 16); // 60fps
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // 초기화
  useEffect(() => {
    loadSprites();
    initGame();
  }, [loadSprites, initGame]);

  return (
    <div className={styles.dinoGameApp}>
      <div className={styles.gameHeader}>
        <div className={styles.score}>
          <span>점수: {score}</span>
          <span>최고점수: {highScore}</span>
        </div>
      </div>
      
      <div className={styles.gameArea}>
        <canvas
          ref={canvasRef}
          className={styles.gameCanvas}
        />
        
        {gameState === 'ready' && (
          <div className={styles.gameOverlay}>
            <div className={styles.startScreen}>
              <h2>🦕 공룡 달리기</h2>
              <p>스페이스바: 점프</p>
              <p>아래 방향키: 숙이기 (새 피하기)</p>
              <p>숙인 상태에서도 달리기 애니메이션!</p>
              <button onClick={startGame} className={styles.startButton}>
                게임 시작
              </button>
            </div>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className={styles.gameOverlay}>
            <div className={styles.gameOverScreen}>
              <h2>게임 오버!</h2>
              <p>점수: {score}</p>
              <p>최고점수: {highScore}</p>
              <button onClick={restartGame} className={styles.restartButton}>
                다시 시작
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.gameInstructions}>
        <p>스페이스바: 점프 | 아래 방향키: 숙이기 | 게임 오버 후 스페이스바: 재시작</p>
      </div>
    </div>
  );
};

export default DinoGameApp;
