import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Card } from "@consta/uikit/Card";
import styles from "./EsoGame.module.css";
import {
  BONUS_HEIGHT,
  BONUS_POINTS,
  BONUS_WIDTH,
  GAME_CONSTANTS,
} from "./constants";
import {
  GameState,
  CharacterType,
  Barrel,
  Coin,
  Cloud,
  Bird,
  Star,
  GrassBlade,
  Bonus,
} from "./types";
import CharacterShell from "./CharacterShell";
import { getCharacter } from "./characters";
import BarrelComponent from "./Barrel";
import CoinComponent from "./Coin";
import CloudComponent from "./Cloud";
import BirdComponent from "./Bird";
import StarComponent from "./Star";
import GameControls from "./GameControls";
import ScoreDisplay from "./ScoreDisplay";
import BonusComponent from "./Bonus";
import GrassField from "./GrassField";

interface EsoGameProps {
  isNightMode: boolean;
}

const STORAGE_KEYS = {
  highScore: "highScore",
  character: "selectedCharacter",
  muted: "soundMuted",
} as const;

const EsoGame: React.FC<EsoGameProps> = ({ isNightMode }) => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [characterType, setCharacterType] = useState<CharacterType>("bear");
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(GAME_CONSTANTS.INITIAL_GAME_SPEED);
  const [bearPos, setBearPos] = useState({ x: 50, y: 0 });
  const [barrels, setBarrels] = useState<Barrel[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [grass, setGrass] = useState<GrassBlade[]>([]);
  const [windForce, setWindForce] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [groundOffset, setGroundOffset] = useState(0);
  const [muted, setMuted] = useState(false);

  // Refs для хранения изменяемых значений
  const jumpVelocity = useRef(0);
  const gameLoopRef = useRef<number>(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout>(undefined);
  const windDirection = useRef(1); // 1 или -1 для направления ветра
  const windTimer = useRef<NodeJS.Timeout>(undefined);

  // Зеркала состояния в refs — игровой цикл читает их, не перезапуская эффект
  const barrelsRef = useRef<Barrel[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const bonusesRef = useRef<Bonus[]>([]);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const gameSpeedRef = useRef(GAME_CONSTANTS.INITIAL_GAME_SPEED);
  const isJumpingRef = useRef(false);
  const isNightModeRef = useRef(false);
  const bearPosRef = useRef({ x: 50, y: 0 });
  const mutedRef = useRef(false);

  useEffect(() => { barrelsRef.current = barrels; }, [barrels]);
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { bonusesRef.current = bonuses; }, [bonuses]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { highScoreRef.current = highScore; }, [highScore]);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);
  useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);
  useEffect(() => { isNightModeRef.current = isNightMode; }, [isNightMode]);
  useEffect(() => { bearPosRef.current = bearPos; }, [bearPos]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const playBonusSound = useCallback(() => {
    if (mutedRef.current) return;
    const audio = new Audio("/sounds/bonus.mp3");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Ошибка воспроизведения аудио:", e));
  }, []);
  const playCoinSound = useCallback(() => {
    if (mutedRef.current) return;
    const audio = new Audio("/sounds/coin.mp3");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Ошибка воспроизведения аудио:", e));
  }, []);
  const playJumpSound = useCallback(() => {
    if (mutedRef.current) return;
    const audio = new Audio("/sounds/jump.mp3");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Ошибка воспроизведения аудио:", e));
  }, []);
  // Функция расчета скорости игры
  const calculateGameSpeed = useCallback((currentScore: number) => {
    const progress = Math.min(currentScore / 2000, 1);
    return (
      GAME_CONSTANTS.INITIAL_GAME_SPEED +
      (GAME_CONSTANTS.MAX_GAME_SPEED - GAME_CONSTANTS.INITIAL_GAME_SPEED) *
        Math.pow(progress, 2)
    );
  }, []);

  // Генерация травы
  const generateGrass = useCallback(() => {
    const grassArray: GrassBlade[] = [];
    const density = 3;
    const period = GAME_CONSTANTS.GAME_WIDTH * 0.5; // период для бесшовного скролла
    const grassWidth = GAME_CONSTANTS.GAME_WIDTH * 1.5; // три копии периода

    // Генерируем один период травы
    const periodBlades: Omit<GrassBlade, "id" | "x">[] = [];
    for (let x = 0; x < period; x += density) {
      periodBlades.push({
        height: 5 + Math.random() * 13, // короткая естественная трава
        stiffness: 0.3 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.4,
        layer: Math.floor(Math.random() * 3), // 0, 1 или 2 - слой для параллакса
        lean: Math.random() * 2 - 1, // естественный наклон влево/вправо (-1..1)
        tone: Math.random() * 2 - 1, // вариация цвета травинки (-1..1)
      });
    }

    // Тиражируем период по всей ширине (бесшовный повтор)
    let id = 0;
    for (let rep = 0; rep * period < grassWidth; rep++) {
      periodBlades.forEach((blade, idx) => {
        grassArray.push({
          ...blade,
          id: id++,
          x: rep * period + idx * density,
        });
      });
    }

    setGrass(grassArray);
  }, []);
  // Загрузка рекорда и выбранного персонажа
  useEffect(() => {
    // Миграция со старого ключа (bearHighScore)
    const legacyHighScore = localStorage.getItem("bearHighScore");
    if (legacyHighScore && !localStorage.getItem(STORAGE_KEYS.highScore)) {
      localStorage.setItem(STORAGE_KEYS.highScore, legacyHighScore);
      localStorage.removeItem("bearHighScore");
    }

    const savedHighScore = localStorage.getItem(STORAGE_KEYS.highScore);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    const savedCharacter = localStorage.getItem(STORAGE_KEYS.character);
    if (savedCharacter === "bear" || savedCharacter === "rabbit") {
      setCharacterType(savedCharacter);
    }
    const savedMuted = localStorage.getItem(STORAGE_KEYS.muted);
    if (savedMuted === "true") {
      setMuted(true);
    }
  }, []);

  // Выбор персонажа
  const selectCharacter = useCallback((type: CharacterType) => {
    setCharacterType(type);
    localStorage.setItem(STORAGE_KEYS.character, type);
  }, []);

  // Прыжок медведя
  const jump = useCallback(() => {
    if (gameState !== "running" || isJumpingRef.current) return;
    setIsJumping(true);
    playJumpSound();
    jumpVelocity.current = GAME_CONSTANTS.JUMP_VELOCITY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Обрезка прыжка: при отпускании клавиши ограничиваем восходящую скорость,
  // чтобы прыжок был ниже, но с плавной дугой (без резкого падения)
  const jumpCut = useCallback(() => {
    if (jumpVelocity.current > GAME_CONSTANTS.JUMP_CUT_VELOCITY) {
      jumpVelocity.current = GAME_CONSTANTS.JUMP_CUT_VELOCITY;
    }
  }, []);

  // Эффект для управления ветром
  useEffect(() => {
    if (gameState !== "running") {
      setWindForce(0); // Сбрасываем ветер при остановке игры
      return;
    }

    const updateWind = () => {
      // Плавное изменение направления с небольшой случайностью
      if (Math.random() < 0.02) {
        windDirection.current *= -1;
      }

      // Плавное изменение силы ветра
      setWindForce((prev) => {
        const change = (Math.random() * 0.2 - 0.1) * windDirection.current;
        let newForce = prev + change;

        // Ограничиваем силу ветра от -1 до 1
        newForce = Math.max(-1, Math.min(1, newForce));

        // Увеличиваем вероятность успокоения ветра
        if (Math.abs(newForce) < 0.1 && Math.random() < 0.3) {
          return 0;
        }

        return newForce;
      });
    };

    windTimer.current = setInterval(updateWind, 1500);

    return () => {
      if (windTimer.current) clearInterval(windTimer.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (isNightMode) {
      setStars(
        Array.from({ length: 30 }, (_, i) => ({
          id: i,
          x: Math.random() * GAME_CONSTANTS.GAME_WIDTH,
          y:
            Math.random() *
            (GAME_CONSTANTS.GAME_HEIGHT - GAME_CONSTANTS.GROUND_HEIGHT - 20),
          size: 0.5 + Math.random() * 2,
        }))
      );
      generateGrass();
    } else {
      setClouds(
        Array.from({ length: 10 }, (_, i) => ({
          id: i,
          x: Math.random() * GAME_CONSTANTS.GAME_WIDTH,
          y: 20 + Math.random() * 160,
          speed: 0.5 + Math.random(),
          width: 40 + Math.random() * 30,
        }))
      );
      generateGrass();
    }
    setBirds(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * GAME_CONSTANTS.GAME_WIDTH,
        y: 30 + Math.random() * 120,
        speed: 0.3 + Math.random() * 0.4,
        size: 14 + Math.random() * 8,
      }))
    );
  }, [isNightMode, generateGrass]);

  //Старт игры
  const startGame = useCallback(() => {
    setGameState("running");
    setScore(0);
    setTotalCoins(0);
    setIsJumping(false);
    setBearPos({ x: 60, y: 0 });
    setBarrels([]);
    setCoins([]);
    setBonuses([]);
    setGameSpeed(GAME_CONSTANTS.INITIAL_GAME_SPEED);
    setClouds(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * GAME_CONSTANTS.GAME_WIDTH * 1.5,
        y: 20 + Math.random() * 160,
        speed: 0.5 + Math.random() * 0.7,
        width: 40 + Math.random() * 30,
      }))
    );
    setBirds(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * GAME_CONSTANTS.GAME_WIDTH,
        y: 30 + Math.random() * 120,
        speed: 0.3 + Math.random() * 0.4,
        size: 14 + Math.random() * 8,
      }))
    );
    clearInterval(scoreIntervalRef.current);
    scoreIntervalRef.current = setInterval(() => {
      setScore((s) => s + 1);
    }, 100);
  }, []);

  const endGame = useCallback(() => {
    setGameState("gameOver");
    clearInterval(scoreIntervalRef.current);
    cancelAnimationFrame(gameLoopRef.current);
    setIsJumping(false);
    setBearPos((p) => ({ ...p, y: 0 }));

    if (scoreRef.current > highScoreRef.current) {
      setHighScore(scoreRef.current);
      localStorage.setItem(STORAGE_KEYS.highScore, scoreRef.current.toString());
    }
  }, []);

  // Основной игровой цикл
  useEffect(() => {
    if (gameState !== "running") return;

    const frame = () => {
      const pos = bearPosRef.current;
      const bearBox = {
        x: pos.x + 7,
        y: pos.y + 4,
        width: GAME_CONSTANTS.BEAR_WIDTH - 15,
        height: GAME_CONSTANTS.BEAR_HEIGHT - 24,
      };
      const speed = gameSpeedRef.current;

      // Прыжок (переменная высота + асимметричная гравитация + зависание у вершины)
      if (isJumpingRef.current) {
        const v = jumpVelocity.current;
        const absV = Math.abs(v);
        const gravity =
          absV < GAME_CONSTANTS.HANG_THRESHOLD
            ? GAME_CONSTANTS.HANG_GRAVITY
            : v > 0
              ? GAME_CONSTANTS.GRAVITY
              : GAME_CONSTANTS.FALL_GRAVITY;
        const newY = pos.y + jumpVelocity.current;
        jumpVelocity.current -= gravity;
        let finalY = newY;
        if (newY <= 0) {
          finalY = 0;
          jumpVelocity.current = 0;
          setIsJumping(false);
        } else if (newY > GAME_CONSTANTS.JUMP_HEIGHT) {
          jumpVelocity.current = 0;
          finalY = GAME_CONSTANTS.JUMP_HEIGHT;
        }
        setBearPos({ x: pos.x, y: finalY });
      }

      // Движение объектов
      setBarrels((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((b) => ({ ...b, x: b.x - speed }))
          .filter((b) => b.x > -GAME_CONSTANTS.BARREL_WIDTH);
      });
      setCoins((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((c) => ({ ...c, x: c.x - speed }))
          .filter((c) => c.x > -GAME_CONSTANTS.COIN_SIZE);
      });
      setBonuses((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((b) => ({ ...b, x: b.x - speed }))
          .filter((b) => b.x > -BONUS_WIDTH);
      });

      // Облака (день)
      if (!isNightModeRef.current) {
        setClouds((prevClouds) => {
          let clouds = prevClouds.map((c) => ({
            ...c,
            x: c.x - c.speed * (speed / 5),
          }));
          clouds = clouds.filter((c) => c.x > -150);
          if (clouds.length < 10 || (clouds.length < 13 && Math.random() < 0.02)) {
            const cloudWidth = 40 + Math.random() * 30;
            clouds.push({
              id: Date.now(),
              x: GAME_CONSTANTS.GAME_WIDTH + cloudWidth,
              y: 20 + Math.random() * 160,
              speed: 0.5 + Math.random() * 0.7,
              width: cloudWidth,
            });
          }
          return clouds;
        });
      }

      // Звёзды (ночь)
      if (isNightModeRef.current) {
        setStars((prev) => {
          let updated = prev.map((s) => ({ ...s, x: s.x - 0.3 }));
          updated = updated.filter((s) => s.x > -10);
          if (Math.random() < 0.02) {
            updated.push({
              id: Date.now(),
              x: GAME_CONSTANTS.GAME_WIDTH,
              y:
                Math.random() *
                (GAME_CONSTANTS.GAME_HEIGHT - GAME_CONSTANTS.GROUND_HEIGHT - 20),
              size: 0.5 + Math.random() * 2,
            });
          }
          return updated;
        });
      }

      // Птицы (всегда)
      setBirds((prev) => {
        let updated = prev.map((b) => ({ ...b, x: b.x - b.speed }));
        updated = updated.filter((b) => b.x > -40);
        if (updated.length < 5 && Math.random() < 0.02) {
          updated.push({
            id: Date.now(),
            x: GAME_CONSTANTS.GAME_WIDTH + 30,
            y: 30 + Math.random() * 120,
            speed: 0.3 + Math.random() * 0.4,
            size: 14 + Math.random() * 8,
          });
        }
        return updated;
      });

      // Трава скроллится медленнее дороги (параллакс)
      setParallaxOffset(
        (prev) => (prev + speed * 0.5) % (GAME_CONSTANTS.GAME_WIDTH * 0.5)
      );
      // Земля скроллится с той же скоростью, что и препятствия (движение под ногами)
      setGroundOffset((prev) => (prev + speed) % 192);

      // Спавн бочек
      const barrelsNow = barrelsRef.current;
      if (
        Math.random() < 0.01 &&
        (barrelsNow.length === 0 ||
          barrelsNow[barrelsNow.length - 1].x < GAME_CONSTANTS.GAME_WIDTH - 300)
      ) {
        setBarrels((prev) => [
          ...prev,
          { id: Date.now(), x: GAME_CONSTANTS.GAME_WIDTH },
        ]);
      }

      // Спавн монет
      if (Math.random() < 0.002 && coinsRef.current.length < 3) {
        setCoins((prev) => [
          ...prev,
          {
            id: Date.now(),
            x: GAME_CONSTANTS.GAME_WIDTH,
            y: 40 + Math.random() * 60,
            collected: false,
          },
        ]);
      }

      // Спавн бонуса
      if (Math.random() < 0.001 && bonusesRef.current.length === 0) {
        setBonuses([
          {
            id: Date.now(),
            x: GAME_CONSTANTS.GAME_WIDTH,
            y: 40 + Math.random() * 50,
            type: "gazprom",
            collected: false,
          },
        ]);
      }

      // Сбор монет
      const hitCoinIds = new Set<number>();
      for (const coin of coinsRef.current) {
        if (coin.collected || Math.abs(coin.x - pos.x) >= 100) continue;
        const coinBox = {
          x: coin.x - 4,
          y: coin.y - 4,
          width: GAME_CONSTANTS.COIN_SIZE + 8,
          height: GAME_CONSTANTS.COIN_SIZE + 8,
        };
        const overlaps =
          bearBox.x < coinBox.x + coinBox.width &&
          bearBox.x + bearBox.width > coinBox.x &&
          bearBox.y < coinBox.y + coinBox.height &&
          bearBox.y + bearBox.height > coinBox.y;
        if (overlaps) hitCoinIds.add(coin.id);
      }
      if (hitCoinIds.size > 0) {
        setCoins((prev) => prev.filter((c) => !hitCoinIds.has(c.id)));
        setScore((s) => s + hitCoinIds.size * GAME_CONSTANTS.COIN_POINTS);
        setTotalCoins((c) => c + hitCoinIds.size);
        playCoinSound();
      }

      // Столкновение с бочкой
      const hitBarrel = barrelsRef.current.some((b) => {
        const barrelBox = {
          x: b.x + 5,
          y: 0,
          width: GAME_CONSTANTS.BARREL_WIDTH - 10,
          height: GAME_CONSTANTS.BARREL_HEIGHT - 10,
        };
        return (
          bearBox.x < barrelBox.x + barrelBox.width &&
          bearBox.x + bearBox.width > barrelBox.x &&
          bearBox.y < barrelBox.y + barrelBox.height &&
          bearBox.y + bearBox.height > barrelBox.y
        );
      });
      if (hitBarrel) {
        endGame();
        return;
      }

      // Сбор бонуса
      const collectedBonus = bonusesRef.current.find((b) => {
        if (b.collected) return false;
        const bonusBox = {
          x: b.x,
          y: b.y,
          width: BONUS_WIDTH,
          height: BONUS_HEIGHT,
        };
        return (
          bearBox.x < bonusBox.x + bonusBox.width &&
          bearBox.x + bearBox.width > bonusBox.x &&
          bearBox.y < bonusBox.y + bonusBox.height &&
          bearBox.y + bearBox.height > bonusBox.y
        );
      });
      if (collectedBonus) {
        playBonusSound();
        setBonuses((prev) => prev.filter((b) => b.id !== collectedBonus.id));
        setScore((s) => s + BONUS_POINTS);
      }

      setGameSpeed(calculateGameSpeed(scoreRef.current));
      gameLoopRef.current = requestAnimationFrame(frame);
    };

    gameLoopRef.current = requestAnimationFrame(frame);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, endGame, calculateGameSpeed, playCoinSound, playBonusSound]);

  // Управление с клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== "ArrowUp") return;
      // Не даём Space/стрелке прокручивать страницу
      e.preventDefault();
      // Игнорируем автоповтор (зажатие клавиши) — иначе прыжок зацикливается
      if (e.repeat) return;
      if (isJumpingRef.current) return;
      if (gameState === "idle" || gameState === "gameOver") startGame();
      else jump();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== "ArrowUp") return;
      jumpCut();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, jump, jumpCut, startGame]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearInterval(scoreIntervalRef.current);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const character = getCharacter(characterType);

  return (
    <Card
      className={`${styles.gameCard} ${isNightMode ? styles.night : ""}`}
    >
      <div className={styles.gameContainer}>
        {/* Трава */}
        <GrassField
          grass={grass}
          windForce={windForce}
          parallaxOffset={parallaxOffset}
          isNight={isNightMode}
        />
        {/* Солнце (только днём) */}
        {!isNightMode && <div className={styles.sun} />}

        {/* Месяц (только ночью) */}
        {isNightMode && (
          <div className={styles.moon}>
            <svg viewBox="0 0 64 64" width="100%" height="100%">
              <path
                d="M39.5 4.5c-15.5 0-28 12.5-28 28s12.5 28 28 28c2.5 0 5-.3 7.4-.9C37.6 54.4 31 44.4 31 32.5S37.6 10.6 46.9 5.4c-2.4-.6-4.9-.9-7.4-.9z"
                fill="#f5efd2"
              />
            </svg>
          </div>
        )}

        {/* Холмы и горы (дальний план) */}
        <svg
          className={styles.hills}
          viewBox="0 0 600 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Дальние горы */}
          <path
            d="M0 140 L25 100 L60 140 L115 58 L150 140 L205 78 L250 140 L305 48 L345 140 L400 80 L450 140 L505 55 L545 140 L600 70 L600 140 Z"
            fill={isNightMode ? "#3d4f5f" : "#a9c3d4"}
            opacity="0.9"
          />
          {/* Снежные шапки (только днём) */}
          {!isNightMode && (
            <>
              <path d="M115 58 L103 80 L115 70 L127 80 Z" fill="#ffffff" opacity="0.9" />
              <path d="M305 48 L293 70 L305 60 L317 70 Z" fill="#ffffff" opacity="0.9" />
              <path d="M505 55 L493 77 L505 67 L517 77 Z" fill="#ffffff" opacity="0.9" />
            </>
          )}
          {/* Ближние холмы (плавные) */}
          <path
            d="M0 140 Q50 98 105 112 Q160 80 220 102 Q285 86 345 108 Q405 76 470 102 Q530 90 600 140 Z"
            fill={isNightMode ? "#2f4232" : "#7fb069"}
            opacity="0.95"
          />
        </svg>

        {/* Облака и звезды */}
        {isNightMode
          ? stars.map((star) => <StarComponent key={star.id} {...star} />)
          : clouds.map((cloud) => (
              <CloudComponent key={`cloud-${cloud.id}`} {...cloud} />
            ))}

        {/* Птицы */}
        {birds.map((bird) => (
          <BirdComponent key={`bird-${bird.id}`} {...bird} />
        ))}

        {/* Бочки */}
        {barrels.map((barrel) => (
          <BarrelComponent key={barrel.id} x={barrel.x} />
        ))}

        {/* Монетки */}
        {coins
          .filter((c) => !c.collected)
          .map((coin) => (
            <CoinComponent key={coin.id} x={coin.x} y={coin.y} />
          ))}

        {bonuses
          .filter((b) => !b.collected)
          .map((bonus) => (
            <BonusComponent
              key={bonus.id}
              x={bonus.x}
              y={bonus.y}
              type={bonus.type}
            />
          ))}

        {/* Тень персонажа */}
        <div
          className={styles.characterShadow}
          style={{
            bottom: `${GAME_CONSTANTS.GROUND_HEIGHT / 2 - 9}px`,
            left: `${bearPos.x + character.shadowLeftOffset}px`,
            width: `${character.shadowWidth}px`,
            opacity: Math.max(0, 1 - bearPos.y / GAME_CONSTANTS.JUMP_HEIGHT),
            transform: `scaleX(${1 - (bearPos.y / GAME_CONSTANTS.JUMP_HEIGHT) * 0.6})`,
          }}
        />

        {/* Персонаж */}
        <CharacterShell
          x={bearPos.x}
          y={bearPos.y}
          isJumping={isJumping}
          isRunning={gameState === "running"}
          isGameOver={gameState === "gameOver"}
          onClick={gameState !== "running" ? startGame : jump}
          bottomOffset={character.bottomOffset}
          Art={character.Art}
        />

        {/* Земля */}
        <div className={styles.ground}>
          <div
            className={styles.groundTexture}
            style={{ backgroundPositionX: `-${groundOffset}px` }}
          />
        </div>

        {/* Счет */}
        <ScoreDisplay
          score={score}
          highScore={Math.max(score, highScore)}
          coins={totalCoins}
        />

        {/* Кнопка звука */}
        <button
          className={styles.muteButton}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            localStorage.setItem(STORAGE_KEYS.muted, String(next));
          }}
          title={muted ? "Включить звук" : "Выключить звук"}
        >
          {muted ? "🔇" : "🔊"}
        </button>

        {/* Управление */}
        {gameState !== "running" && (
          <GameControls
            gameState={gameState}
            onStartGame={startGame}
            score={score}
            characterType={characterType}
            onSelectCharacter={selectCharacter}
          />
        )}
      </div>
    </Card>
  );
};
export default EsoGame;
