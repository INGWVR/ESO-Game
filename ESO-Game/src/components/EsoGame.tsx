import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@consta/uikit/Card";
import { Text } from "@consta/uikit/Text";
import { Button } from "@consta/uikit/Button";
import { Switch } from "@consta/uikit/Switch";
import { IconRestart } from "@consta/icons/IconRestart";
import { IconMoon } from "@consta/icons/IconMoon";
import { IconSun } from "@consta/icons/IconSun";
import { IconArrowUp } from "@consta/icons/IconArrowUp";
import styles from "./EsoGame.module.css";

const EsoGame = () => {
  // Константы игры
  const BEAR_WIDTH = 45; // Увеличим ширину медведя
  const BEAR_HEIGHT = 65; // Увеличим высоту медведя
  const BARREL_WIDTH = 40;
  const BARREL_HEIGHT = 40;
  const COIN_SIZE = 20;
  const GROUND_HEIGHT = 20;
  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 200;
  const JUMP_VELOCITY = 10; // Начальная скорость прыжка (меньше для плавности)
  const GRAVITY = 0.03; // Сила гравитации (меньше для плавности)
  const JUMP_HEIGHT = 120; // Максимальная высота прыжка
  const INITIAL_GAME_SPEED = 2; // Начальная скорость
  const MAX_GAME_SPEED = 10; // Максимальная скорость

  // Состояния игры
  const [gameState, setGameState] = useState<"idle" | "running" | "gameOver">(
    "idle"
  );
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(5);
  const [bearPos, setBearPos] = useState({ x: 50, y: 0 });
  const [barrels, setBarrels] = useState<Array<{ id: number; x: number }>>([]);
  const [coins, setCoins] = useState<
    Array<{ id: number; x: number; y: number; collected?: boolean }>
  >([]);
  const [clouds, setClouds] = useState<
    Array<{ id: number; x: number; y: number; speed: number; width: number }>
  >([]);
  const [stars, setStars] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);
  const [grass, setGrass] = useState<
    Array<{ id: number; x: number; height: number }>
  >([]);
  const [grassOffset, setGrassOffset] = useState(0);
  // Refs для хранения изменяемых значений
  const jumpVelocity = useRef(0);
  const gameLoopRef = useRef<number>(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout>(undefined);

  // Функция расчета скорости игры
  const calculateGameSpeed = (currentScore: number) => {
    const progress = Math.min(currentScore / 2000, 1); // 2000 - очков до максимальной скорости
    // Используем квадратичную функцию для более плавного старта
    return (
      INITIAL_GAME_SPEED +
      (MAX_GAME_SPEED - INITIAL_GAME_SPEED) * Math.pow(progress, 2)
    );
  };
  const generateGrass = useCallback(() => {
    const grassArray = [];
    const density = 8; // Расстояние между травинками

    for (let i = 0; i < GAME_WIDTH + 10; i += density) {
      grassArray.push({
        id: i,
        x: i,
        height: 5 + Math.random() * 15,
      });
    }
    setGrass(grassArray);
  }, []);
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
    jumpVelocity.current = JUMP_VELOCITY; // Используем новую константу
  }, [gameState, isJumping]);
  useEffect(() => {
    if (!isNightMode) {
      generateGrass();
    }
  }, [isNightMode, generateGrass]);
  // Основной игровой цикл
  useEffect(() => {
    if (gameState !== "running") return;

    const frame = () => {
      // Физика прыжка
      setBearPos((pos) => {
        if (!isJumping) return pos;

        // Обновляем позицию с учетом скорости
        const newY = pos.y + jumpVelocity.current;

        // Применяем гравитацию
        jumpVelocity.current -= GRAVITY;

        // Проверяем, достигли ли земли
        if (newY <= 0) {
          setIsJumping(false);
          jumpVelocity.current = 0;
          // Небольшой "присед" при приземлении
          setTimeout(() => {
            setBearPos((pos) => ({ ...pos, y: 0 }));
          }, 50);
          return { ...pos, y: 0 };
        }

        // Ограничиваем максимальную высоту прыжка
        if (newY > JUMP_HEIGHT) {
          jumpVelocity.current = 0;
          return { ...pos, y: JUMP_HEIGHT };
        }

        return { ...pos, y: newY };
      });

      // Движение объектов
      setBarrels((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x - gameSpeed }))
          .filter((b) => b.x > -BARREL_WIDTH)
      );

      setCoins((prev) =>
        prev
          .map((c) => ({ ...c, x: c.x - gameSpeed }))
          .filter((c) => c.x > -COIN_SIZE)
      );

      setClouds((prevClouds) => {
        if (isNightMode) return prevClouds; // Не обновляем облака ночью
        // 1. Двигаем облака и фильтруем только те, что полностью уехали за экран
        let clouds = prevClouds.map((c) => ({
          ...c,
          x: c.x - c.speed * (gameSpeed / 5), // Учитываем скорость игры
        }));

        // 2. Удаляем только те облака, что полностью скрылись
        clouds = clouds.filter((c) => c.x > -150); // -150 чтобы учесть ширину облака

        // 3. Добавляем новые облака если их мало
        if (clouds.length < 5 || (clouds.length < 8 && Math.random() < 0.02)) {
          const cloudWidth = 40 + Math.random() * 30;
          clouds.push({
            id: Date.now(),
            x: GAME_WIDTH + cloudWidth, // Появляется за правым краем
            y: 20 + Math.random() * 60,
            speed: 0.5 + Math.random() * 0.7,
            width: cloudWidth,
          });
        }

        return clouds;
      });

      setStars((prev) => {
        if (!isNightMode) return prev; // Не обновляем звёзды днём

        // Двигаем звёзды (медленнее, чем облака)
        let updated = prev.map((s) => ({ ...s, x: s.x - 0.3 }));

        // Удаляем звёзды, ушедшие за экран
        updated = updated.filter((s) => s.x > -10);

        // Добавляем новые звёзды с небольшим шансом
        if (Math.random() < 0.02) {
          updated.push({
            id: Date.now(),
            x: GAME_WIDTH,
            y: Math.random() * (GAME_HEIGHT - GROUND_HEIGHT - 20),
            size: 0.5 + Math.random() * 2,
          });
        }

        return updated;
      });
      setGrassOffset((prev) => {
        const newOffset = prev + gameSpeed * 0.15;
        return newOffset > 10 ? newOffset - 10 : newOffset;
      });
      // Генерация новых объектов
      if (
        Math.random() < 0.01 &&
        (barrels.length === 0 ||
          barrels[barrels.length - 1].x < GAME_WIDTH - 300)
      ) {
        setBarrels((prev) => [...prev, { id: Date.now(), x: GAME_WIDTH }]);
      }

      if (Math.random() < 0.005) {
        setCoins((prev) => [
          ...prev,
          {
            id: Date.now(),
            x: GAME_WIDTH,
            y: 40 + Math.random() * 60,
            collected: false,
          },
        ]);
      }

      // Проверка столкновений
      const bearBox = {
        x: bearPos.x + 10,
        y: bearPos.y + 10,
        width: BEAR_WIDTH - 20,
        height: BEAR_HEIGHT - 20,
      };

      // Столкновение с бочками
      const hitBarrel = barrels.some((b) => {
        const barrelBox = {
          x: b.x + 5,
          y: GROUND_HEIGHT,
          width: BARREL_WIDTH - 10,
          height: BARREL_HEIGHT,
        };

        return (
          bearBox.x < barrelBox.x + barrelBox.width &&
          bearBox.x + bearBox.width > barrelBox.x &&
          bearBox.y < barrelBox.y + barrelBox.height &&
          bearBox.y + bearBox.height > barrelBox.y
        );
      });

      // Сбор монеток
      const collectedCoins = coins.filter(
        (c) =>
          !c.collected &&
          bearBox.x < c.x + COIN_SIZE &&
          bearBox.x + bearBox.width > c.x &&
          bearBox.y < c.y + COIN_SIZE &&
          bearBox.y + bearBox.height > c.y
      );

      if (hitBarrel) {
        endGame();
        return;
      }

      if (collectedCoins.length > 0) {
        setCoins((prev) =>
          prev.map((c) =>
            collectedCoins.some((cc) => cc.id === c.id)
              ? { ...c, collected: true }
              : c
          )
        );
        setScore((s) => s + collectedCoins.length * 5);
      }

      setGameSpeed(calculateGameSpeed(score));

      gameLoopRef.current = requestAnimationFrame(frame);
    };

    gameLoopRef.current = requestAnimationFrame(frame);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, isJumping, bearPos, barrels, coins, gameSpeed, score]);

  // В функции переключения ночного режима
  const toggleNightMode = () => {
    setIsNightMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        // Инициализируем звёзды при включении ночного режима
        setStars(
          Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * (GAME_HEIGHT - GROUND_HEIGHT - 20),
            size: 0.5 + Math.random() * 2,
          }))
        );
        setGrass([]);
      } else {
        const cloudWidth = 40 + Math.random() * 30;
        // Возвращаем облака при дневном режиме
        setClouds(
          Array.from({ length: 5 }, (_, i) => ({
            id: i,
            x: Math.random() * GAME_WIDTH,
            y: 30 + Math.random() * 50,
            speed: 0.5 + Math.random(),
            width: cloudWidth,
          }))
        );
        generateGrass();
      }
      return newMode;
    });
  };

  // Старт игры
  const startGame = useCallback(() => {
    setGameState("running");
    setScore(0);
    setIsJumping(false);
    setBearPos({ x: 50, y: 0 });
    setBarrels([]);
    setCoins([]);
    setGameSpeed(INITIAL_GAME_SPEED);
    // Инициализация облаков
    setClouds(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * GAME_WIDTH * 1.5,
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

  // Завершение игры
  const endGame = useCallback(() => {
    setGameState("gameOver");
    clearInterval(scoreIntervalRef.current);
    cancelAnimationFrame(gameLoopRef.current);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("bearHighScore", score.toString());
    }
  }, [score, highScore]);

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
      <div className={styles.themeToggle}>
        <Switch
          label={isNightMode ? <IconMoon size="s" /> : <IconSun size="s" />}
          checked={isNightMode}
          onChange={() => toggleNightMode()}
        />
      </div>

      <div className={styles.gameContainer}>
        {/* Трава и цветочки */}
        {!isNightMode &&
          grass.map((blade) => {
            const adjustedX = (blade.x + grassOffset) % GAME_WIDTH;
            return (
              <React.Fragment key={`grass-${blade.id}`}>
                <div
                  className={styles.grassBlade}
                  style={{
                    left: `${adjustedX}px`,
                    height: `${blade.height}px`,
                    bottom: `${GROUND_HEIGHT}px`,
                    transform: `skew(${-20 + (blade.id % 40)}deg)`,
                  }}
                />
                {blade.id % 10 === 0 && (
                  <div
                    className={styles.flower}
                    style={{
                      left: `${adjustedX}px`,
                      bottom: `${GROUND_HEIGHT + blade.height}px`,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        {/* Облака и звузды */}
        {isNightMode
          ? stars.map((star) => (
              <div
                key={star.id}
                className={styles.star}
                style={{
                  left: `${star.x}px`,
                  top: `${star.y}px`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: 0.7,
                  animationDelay: `${(star.id % 10) * 0.2}s`,
                }}
              />
            ))
          : clouds.map((cloud) => (
              <div
                key={`cloud-${cloud.id}`}
                className={styles.cloud}
                style={{
                  left: `${cloud.x}px`,
                  top: `${cloud.y}px`,
                  width: `${cloud.width || 50}px`,
                  opacity: 0.8,
                  transform: `translateX(${cloud.x}px)`,
                }}
              >
                <svg viewBox="0 0 100 60" preserveAspectRatio="none">
                  <path
                    d="M20,40 Q30,20 50,20 Q70,20 80,40 Q90,30 100,40 Q90,50 80,50 Q70,60 50,60 Q30,60 20,50 Z"
                    fill="rgba(255,255,255,0.8)"
                  />
                </svg>
              </div>
            ))}

        {/* Бочки */}
        {barrels.map((barrel) => (
          <div
            key={barrel.id}
            className={styles.barrelContainer}
            style={{
              left: `${barrel.x}px`,
              bottom: `${GROUND_HEIGHT}px`,
              width: `${BARREL_WIDTH}px`,
              height: `${BARREL_HEIGHT}px`,
            }}
          >
            <svg
              viewBox="0 0 511.999 511.999"
              preserveAspectRatio="xMidYMin meet"
              width="100%"
              height="100%"
            >
              <g>
                <polygon
                  fill="#AFB6BB"
                  points="464.159,458.533 464.159,503.541 47.84,503.541 47.84,458.533 87.221,458.533 424.776,458.533"
                ></polygon>
                <polygon
                  fill="#AFB6BB"
                  points="464.159,233.496 464.159,278.504 424.776,278.504 87.221,278.504 47.84,278.504 47.84,233.496 87.221,233.496 424.776,233.496"
                ></polygon>
                <polygon
                  fill="#AFB6BB"
                  points="464.159,8.459 464.159,53.466 424.776,53.466 87.221,53.466 47.84,53.466 47.84,8.459"
                ></polygon>
                <rect
                  x="87.218"
                  y="278.508"
                  fill="#546A79"
                  width="337.553"
                  height="180.033"
                ></rect>
                <rect
                  x="87.218"
                  y="53.462"
                  fill="#546A79"
                  width="337.553"
                  height="180.033"
                ></rect>
                <rect
                  x="87.218"
                  y="53.462"
                  fill="#425562"
                  width="168.776"
                  height="180.033"
                ></rect>
                <rect
                  x="87.218"
                  y="278.508"
                  fill="#425562"
                  width="168.776"
                  height="180.033"
                ></rect>
                <path
                  fill="#000000"
                  d="M472.617,61.925V0H137.85v16.918h317.849v28.089H56.299V16.918h59.051V0h-75.97v61.925h39.382v163.111H39.381v61.925h39.382 v163.111H39.381v61.926h433.237v-61.926h-39.381v-59.051h-16.918v59.051H95.681V326.344h244.708v-16.918H95.681v-22.464h320.637 v81.556h16.918v-81.556h39.381v-61.925h-39.381V61.925H472.617z M455.698,495.082H56.299v-28.09h399.4v28.09H455.698z M455.698,270.044H56.299v-28.089h399.4v28.089H455.698z M416.317,225.036H95.681V101.308h244.708V84.389H95.681V61.925h320.637 L416.317,225.036L416.317,225.036z"
                ></path>
                <rect
                  x="357.267"
                  y="84.389"
                  fill="#000000"
                  width="28.129"
                  height="16.918"
                ></rect>
                <rect
                  x="357.267"
                  y="309.423"
                  fill="#000000"
                  width="28.129"
                  height="16.918"
                ></rect>
                <polygon
                  fill="#FFFFFF"
                  points="118.143,177.237 135.062,177.237 135.062,140.689 165.985,140.689 165.985,123.77 118.143,123.77"
                ></polygon>
                <polygon
                  fill="#FFFFFF"
                  points="135.062,402.274 135.062,365.725 165.985,365.725 165.985,348.807 118.143,348.807 118.143,402.274"
                ></polygon>
                <rect
                  x="374.14"
                  y="185.649"
                  fill="#FFFFFF"
                  width="22.504"
                  height="16.918"
                ></rect>
                <rect
                  x="374.14"
                  y="410.696"
                  fill="#FFFFFF"
                  width="22.504"
                  height="16.918"
                ></rect>
              </g>
            </svg>
          </div>
        ))}

        {/* Монетки */}
        {coins
          .filter((c) => !c.collected)
          .map((coin) => (
            <svg
              key={coin.id}
              className={styles.coin}
              style={{
                left: `${coin.x}px`,
                top: `${coin.y}px`,
              }}
              width={COIN_SIZE}
              height={COIN_SIZE}
            >
              <circle
                cx={COIN_SIZE / 2}
                cy={COIN_SIZE / 2}
                r={COIN_SIZE / 2}
                fill="gold"
              />
              <circle
                cx={COIN_SIZE / 2}
                cy={COIN_SIZE / 2}
                r={COIN_SIZE / 3}
                fill="orange"
              />
            </svg>
          ))}

        {/* Медведь */}
        <div
          className={`${styles.character} ${isJumping ? styles.jumping : ""} ${
            gameState === "running" ? styles.running : ""
          }`}
          style={{
            left: `${bearPos.x}px`,
            bottom: `${bearPos.y + GROUND_HEIGHT}px`,
            width: `${BEAR_WIDTH}px`,
            height: `${BEAR_HEIGHT}px`,
          }}
          onClick={gameState !== "running" ? startGame : jump}
        >
          <svg
            viewBox="30 0 206 236"
            preserveAspectRatio="xMidYMin meet"
            width="100%"
            height="100%"
          >
            {/* Ушки */}
            <g>
              <path
                fill="#9E5B2E"
                d="M60.493,1.347c-29.766,8.208-27.54,56.007-1.162,67.544l41.637-23.792 C100.611,20.925,88.675-6.424,60.493,1.347z"
              />
              <path
                fill="#F4C8C1"
                d="M66.469,62.941c0,0,27.261-10.667,27.362-10.707c2.991-1.307-9.863-29.192-11.423-31.485 c-7.431-10.92-22.753-12.191-29.057-0.005c-6.549,12.659,3.174,35.739,14.476,43.236C69.737,65.064,66.921,63.234,66.469,62.941 z"
              />
            </g>
            <g>
              <path
                fill="#9E5B2E"
                d="M206.263,1.347c29.767,8.208,27.539,56.007,1.162,67.544l-41.637-23.792 C166.145,20.925,178.081-6.424,206.263,1.347z"
              />
              <path
                fill="#F4C8C1"
                d="M200.287,62.941c0,0-27.262-10.667-27.362-10.707c-2.99-1.307,9.861-29.192,11.422-31.485 c7.432-10.92,22.753-12.191,29.059-0.005c6.548,12.659-3.177,35.739-14.478,43.236 C197.019,65.064,199.836,63.234,200.287,62.941z"
              />
            </g>
            {/* Убрали transform, который переворачивал медведя */}
            <g transform="translate(0, 10)">
              {/* Задние лапки */}
              <path
                className={`${styles.backLeg} ${
                  gameState === "running" ? styles.runningLeg : ""
                }`}
                fill="#723F1D"
                d="M131.277,218.618L94.4,205.532c-4.571,17.597-7.123,51.115,14.011,59.769 C132.66,275.231,131.277,231.554,131.277,218.618z"
              ></path>
              <path
                className={`${styles.backLeg} ${
                  gameState === "running" ? styles.runningLeg : ""
                }`}
                fill="#723F1D"
                d="M135.479,218.618l36.878-13.086c4.57,17.597,7.122,51.115-14.012,59.769 C134.097,275.231,135.479,231.554,135.479,218.618z"
              ></path>

              {/* Передние лапки */}
              <path
                className={`${styles.frontLeg} ${
                  gameState === "running" ? styles.runningLeg : ""
                } ${isJumping ? styles.jumpingLeg : ""}`}
                fill="#723F1D"
                d="M86.995,144.707c-10.44,4.907-16.024,23.964-17.562,34.039 c-2.766,18.125,10.652,39.945,29.503,33.527l4.758-58.291C104.378,144.634,95.302,140.803,86.995,144.707z"
              ></path>
              <path
                className={`${styles.frontLeg} ${
                  gameState === "running" ? styles.runningLeg : ""
                } ${isJumping ? styles.jumpingLeg : ""}`}
                fill="#723F1D"
                d="M179.762,144.707c10.44,4.907,16.024,23.964,17.563,34.039 c2.764,18.125-10.653,39.945-29.505,33.527l-4.758-58.291C162.378,144.634,171.455,140.803,179.762,144.707z"
              ></path>
              <path
                fill="#9E5B2E"
                d="M103.879,145.373c23.188-22.521,61.387-10.559,71.047,17.776 c7.148,20.972,7.728,49.018-10.205,64.683c-18.63,16.274-51.122,11.854-66.349-6.159C81.015,201.136,84.58,164.117,103.879,145.373 z"
              ></path>
              <path
                fill="#844A23"
                d="M96.6,152.88c0,0,38.865,45.119,74.348,0H96.6z"
              ></path>
              <path
                fill="#B56F40"
                d="M210.896,66.885c-15.839-23.122-48.035-33.133-77.518-32.402 c-29.482-0.731-61.68,9.28-77.518,32.402c-24.456,35.704,4.621,74.231,40.741,85.995c11.629,3.786,24.261,5.841,36.778,5.964 c12.516-0.123,25.148-2.178,36.776-5.964C206.276,141.115,235.352,102.589,210.896,66.885z"
              ></path>
              <path
                fill="#E28E54"
                d="M75.61,138.953c-6.404-3.12-10.36-9.875-7.035-20.462c5.628-17.922,34.504-19.597,37.089,1.491 C107.873,138,87.512,144.753,75.61,138.953z"
              ></path>
              <path
                fill="#E28E54"
                d="M191.146,138.953c6.404-3.12,10.361-9.875,7.036-20.462c-5.627-17.922-34.503-19.597-37.089,1.491 C158.884,138,179.243,144.753,191.146,138.953z"
              ></path>
              <circle
                fill="#FFFFFF"
                cx="97.774"
                cy="102.299"
                r="16.354"
              ></circle>
              <circle
                fill="#000000"
                cx="97.773"
                cy="102.299"
                r="10.714"
              ></circle>
              <circle
                fill="#FFFFFF"
                cx="105.356"
                cy="95.551"
                r="5.353"
              ></circle>
              <circle
                fill="#FFFFFF"
                cx="168.325"
                cy="102.299"
                r="16.354"
              ></circle>
              <circle
                fill="#000000"
                cx="168.325"
                cy="102.299"
                r="10.715"
              ></circle>
              <circle
                fill="#FFFFFF"
                cx="175.907"
                cy="95.551"
                r="5.354"
              ></circle>
              <path
                fill="#000000"
                d="M149.815,121.461c-3.686-10.22-29.097-10.296-32.803,0.007C111.776,136.029,154.599,134.753,149.815,121.461z"
              ></path>
              <path
                fill="#000000"
                d="M150.241,134.041c-5.527,17.526-27.779,14.493-34.184-0.663c-1.389-3.287-6.17-0.455-4.793,2.803 c3.92,9.275,12.828,15.296,22.861,15.66c10.36,0.376,18.469-6.812,21.469-16.324C156.674,132.094,151.315,130.639,150.241,134.041z"
              ></path>
            </g>
          </svg>
        </div>

        {/* Земля */}
        <div className={styles.ground} />

        {/* Счет */}
        <div className={styles.scoreDisplay}>
          <Text size="s" view="secondary">
            Score: {score}
          </Text>
          <Text size="s" view="secondary">
            High Score: {highScore}
          </Text>
        </div>

        {/* Управление */}
        {gameState !== "running" && (
          <div className={styles.gameControls}>
            {gameState === "gameOver" ? (
              <>
                <Text size="xl" weight="bold" className={styles.gameOver}>
                  Game Over!
                </Text>
                <Button
                  label="Play Again"
                  iconRight={IconRestart}
                  onClick={startGame}
                  size="m"
                />
              </>
            ) : (
              <>
                <Text
                  size="l"
                  weight="semibold"
                  className={styles.startMessage}
                >
                  Press <IconArrowUp size="s" /> or Space to Start
                </Text>
                <Button label="Start Game" onClick={startGame} size="m" />
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
export default EsoGame;
