import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
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
  Barrel,
  Coin,
  Cloud,
  Star,
  GrassBlade,
  Bonus,
} from "./types";
import Bear from "./Bear";
import BarrelComponent from "./Barrel";
import CoinComponent from "./Coin";
import CloudComponent from "./Cloud";
import StarComponent from "./Star";
import GameControls from "./GameControls";
import ScoreDisplay from "./ScoreDisplay";
import BonusComponent from "./Bonus";
import { presetGpnDark, useTheme } from "@consta/uikit/Theme";
import GrassField from "./GrassField";

const EsoGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(GAME_CONSTANTS.INITIAL_GAME_SPEED);
  const [bearPos, setBearPos] = useState({ x: 50, y: 0 });
  const [barrels, setBarrels] = useState<Barrel[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [grass, setGrass] = useState<GrassBlade[]>([]);
  const [grassOffset, setGrassOffset] = useState(0);
  const [windForce, setWindForce] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Refs для хранения изменяемых значений
  const jumpVelocity = useRef(0);
  const gameLoopRef = useRef<number>(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout>(undefined);
  const windDirection = useRef(1); // 1 или -1 для направления ветра
  const windTimer = useRef<NodeJS.Timeout>(undefined);

  const { theme } = useTheme();
  const bearBox = useMemo(
    () => ({
      x: bearPos.x + 7,
      y: bearPos.y + 4,
      width: GAME_CONSTANTS.BEAR_WIDTH - 15,
      height: GAME_CONSTANTS.BEAR_HEIGHT - 24,
    }),
    [bearPos.x, bearPos.y]
  );

  const playBonusSound = useCallback(() => {
    const audio = new Audio("/sounds/bonus.mp3");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Ошибка воспроизведения аудио:", e));
  }, []);
  const playCoinSound = useCallback(() => {
    const audio = new Audio("/sounds/coin.mp3");
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Ошибка воспроизведения аудио:", e));
  }, []);
  const playJumpSound = useCallback(() => {
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

  const handleCoinCollision = useCallback(() => {
    // Проверка столкновения с монетками
    const checkCoinCollision = (coin: Coin) => {
      const coinBox = {
        x: coin.x - 8 / 2,
        y: coin.y - 8 / 2,
        width: GAME_CONSTANTS.COIN_SIZE + 8,
        height: GAME_CONSTANTS.COIN_SIZE + 8,
      };

      return (
        bearBox.x < coinBox.x + coinBox.width &&
        bearBox.x + bearBox.width > coinBox.x &&
        bearBox.y < coinBox.y + coinBox.height &&
        bearBox.y + bearBox.height > coinBox.y
      );
    };

    setCoins((prevCoins) => {
      const newCoins = [...prevCoins];
      let scoreToAdd = 0;
      let coinsToAdd = 0;

      newCoins
        .filter((c) => !c.collected && Math.abs(c.x - bearPos.x) < 100)
        .forEach((coin) => {
          if (checkCoinCollision(coin)) {
            coin.collected = true;
            scoreToAdd += GAME_CONSTANTS.COIN_POINTS;
            coinsToAdd += 1;
            playCoinSound();
          }
        });

      if (scoreToAdd > 0) {
        setScore((prev) => prev + scoreToAdd);
        setTotalCoins((c) => c + coinsToAdd);
      }

      return newCoins.filter((coin) => !coin.collected); // Удаляем только собранные монеты
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bearBox.x, bearBox.y]);
  // Генерация травы
  const generateGrass = useCallback(() => {
    const grassArray: GrassBlade[] = [];
    const density = 4;
    const grassWidth = GAME_CONSTANTS.GAME_WIDTH * 1.5; // Делаем траву шире экрана

    for (let i = 0; i < grassWidth; i += density) {
      grassArray.push({
        id: i,
        x: i,
        height: 10 + Math.random() * 30,
        stiffness: 0.3 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.4,
        layer: Math.floor(Math.random() * 3), // 0, 1 или 2 - слой для параллакса
      });
    }
    setGrass(grassArray);
  }, []);
  const updateGrassAnimation = useCallback(() => {
    setGrassOffset((prev) => (prev + gameSpeed * 0.1) % (2 * Math.PI));
  }, [gameSpeed]);
  // Загрузка рекорда
  useEffect(() => {
    const savedHighScore = localStorage.getItem("bearHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Прыжок медведя
  const jump = useCallback(() => {
    if (gameState !== "running" || isJumping) return;
    setIsJumping(true);
    playJumpSound();
    jumpVelocity.current = GAME_CONSTANTS.JUMP_VELOCITY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, isJumping]);

  useEffect(() => {
    if (!isNightMode) {
      generateGrass();
    }
  }, [isNightMode, generateGrass]);

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
    if (theme.color.primary === presetGpnDark.color.primary) {
      setIsNightMode(true);
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
      setGrass([]);
    } else {
      setIsNightMode(false);
      const cloudWidth = 40 + Math.random() * 30;
      setClouds(
        Array.from({ length: 5 }, (_, i) => ({
          id: i,
          x: Math.random() * GAME_CONSTANTS.GAME_WIDTH,
          y: 30 + Math.random() * 50,
          speed: 0.5 + Math.random(),
          width: cloudWidth,
        }))
      );
      generateGrass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.color.primary]);

  //Старт игры
  const startGame = useCallback(() => {
    setGameState("running");
    setScore(0);
    setTotalCoins(0);
    setIsJumping(false);
    setBearPos({ x: 60, y: 0 });
    setBarrels([]);
    setCoins([]);
    setGameSpeed(GAME_CONSTANTS.INITIAL_GAME_SPEED);
    setClouds(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * GAME_CONSTANTS.GAME_WIDTH * 1.5,
        y: 20 + Math.random() * 60,
        speed: 0.5 + Math.random() * 0.7,
        width: 40 + Math.random() * 30,
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

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("bearHighScore", score.toString());
    }
  }, [score, highScore]);

  // Основной игровой цикл
  useEffect(() => {
    if (gameState !== "running") return;
    const updateParallax = () => {
      // Медведь движется вправо, трава должна смещаться медленнее (параллакс)
      setParallaxOffset((prev) => {
        const newOffset = prev + gameSpeed * 0.3; // Коэффициент замедления
        return newOffset % (GAME_CONSTANTS.GAME_WIDTH * 0.5); // Зацикливаем смещение
      });
    };
    const frame = () => {
      setBearPos((pos) => {
        if (!isJumping) return pos;

        const newY = pos.y + jumpVelocity.current;
        jumpVelocity.current -= GAME_CONSTANTS.GRAVITY;

        if (newY <= 0) {
          setIsJumping(false);
          jumpVelocity.current = 0;
          setTimeout(() => {
            setBearPos((pos) => ({ ...pos, y: 0 }));
          }, 50);
          return { ...pos, y: 0 };
        }

        if (newY > GAME_CONSTANTS.JUMP_HEIGHT) {
          jumpVelocity.current = 0;
          return { ...pos, y: GAME_CONSTANTS.JUMP_HEIGHT };
        }

        return { ...pos, y: newY };
      });

      setBarrels((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x - gameSpeed }))
          .filter((b) => b.x > -GAME_CONSTANTS.BARREL_WIDTH)
      );

      setCoins((prev) =>
        prev
          .map((c) => ({ ...c, x: c.x - gameSpeed }))
          .filter((c) => c.x > -GAME_CONSTANTS.COIN_SIZE)
      );

      setBonuses((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x - gameSpeed }))
          .filter((b) => b.x > -BONUS_WIDTH)
      );

      setClouds((prevClouds) => {
        if (isNightMode) return prevClouds;
        let clouds = prevClouds.map((c) => ({
          ...c,
          x: c.x - c.speed * (gameSpeed / 5),
        }));
        clouds = clouds.filter((c) => c.x > -150);
        if (clouds.length < 5 || (clouds.length < 8 && Math.random() < 0.02)) {
          const cloudWidth = 40 + Math.random() * 30;
          clouds.push({
            id: Date.now(),
            x: GAME_CONSTANTS.GAME_WIDTH + cloudWidth,
            y: 20 + Math.random() * 60,
            speed: 0.5 + Math.random() * 0.7,
            width: cloudWidth,
          });
        }
        return clouds;
      });

      setStars((prev) => {
        if (!isNightMode) return prev;
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

      updateGrassAnimation();
      if (
        Math.random() < 0.01 &&
        (barrels.length === 0 ||
          barrels[barrels.length - 1].x < GAME_CONSTANTS.GAME_WIDTH - 300)
      ) {
        setBarrels((prev) => [
          ...prev,
          { id: Date.now(), x: GAME_CONSTANTS.GAME_WIDTH },
        ]);
      }

      if (Math.random() < 0.002 && coins.length < 3) {
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

      if (Math.random() < 0.001 && bonuses.length === 0) {
        setBonuses([
          {
            id: Date.now(),
            x: GAME_CONSTANTS.GAME_WIDTH,
            y: GAME_CONSTANTS.GROUND_HEIGHT + 40 + Math.random() * 50,
            type: "gazprom",
            collected: false,
          },
        ]);
      }
      //Проверка на подбор монет
      handleCoinCollision();

      //Проверка на столкновение с бочкой
      const hitBarrel = barrels.some((b) => {
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

      // Проверка столкновения с бонусом
      const collectedBonus = bonuses.find((b) => {
        if (b.collected) return false;
        // Хитбокс бонуса
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
        setBonuses((prev) =>
          prev.map((b) =>
            b.id === collectedBonus.id ? { ...b, collected: true } : b
          )
        );
        setScore((s) => s + BONUS_POINTS);
      }

      setGameSpeed(calculateGameSpeed(score));
      gameLoopRef.current = requestAnimationFrame(frame);
    };
    const parallaxInterval = setInterval(updateParallax, 16);
    gameLoopRef.current = requestAnimationFrame(frame);
    return () => {
      clearInterval(parallaxInterval);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameState,
    isJumping,
    bearPos,
    barrels,
    coins,
    gameSpeed,
    isNightMode,
    endGame,
    bonuses,
    handleCoinCollision,
    bearBox.x,
    bearBox.y,
  ]);

  // Управление с клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.key === "ArrowUp") && !isJumping) {
        if (gameState === "idle") startGame();
        else jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, isJumping, jump, startGame]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearInterval(scoreIntervalRef.current);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  return (
    <Card
      verticalSpace="xl"
      horizontalSpace="xl"
      className={`${styles.gameCard} ${isNightMode ? styles.night : ""}`}
    >
      <div className={styles.gameContainer}>
        {/* Трава и цветочки */}
        {!isNightMode && (
          <GrassField
            grass={grass}
            offset={grassOffset}
            windForce={windForce}
            parallaxOffset={parallaxOffset}
          />
        )}
        {/* Облака и звузды */}
        {isNightMode
          ? stars.map((star) => <StarComponent key={star.id} {...star} />)
          : clouds.map((cloud) => (
              <CloudComponent key={`cloud-${cloud.id}`} {...cloud} />
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

        {/* Медведь */}
        <Bear
          x={bearPos.x}
          y={bearPos.y}
          isJumping={isJumping}
          isRunning={gameState === "running"}
          onClick={gameState !== "running" ? startGame : jump}
        />

        {/* Земля */}
        <div className={styles.ground} />

        {/* Счет */}
        <ScoreDisplay score={score} highScore={highScore} coins={totalCoins} />

        {/* Управление */}
        {gameState !== "running" && (
          <GameControls gameState={gameState} onStartGame={startGame} />
        )}
      </div>
    </Card>
  );
};
export default EsoGame;
