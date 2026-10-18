import React from "react";
import styles from "./EsoGame.module.css";
import { GAME_CONSTANTS } from "./constants";

/** Пропсы, которые получает SVG-арт персонажа (без обёртки). */
export interface CharacterArtProps {
  isJumping: boolean;
  isRunning: boolean;
}

export interface CharacterShellProps {
  x: number;
  y: number;
  isJumping: boolean;
  isRunning: boolean;
  isGameOver: boolean;
  onClick: () => void;
  showHitbox?: boolean;
  /** Сдвиг по вертикали относительно земли (например, -4 у медведя, -9 у кролика). */
  bottomOffset: number;
  /** Компонент, отрисовывающий только SVG-арт персонажа. */
  Art: React.ComponentType<CharacterArtProps>;
}

const CharacterShell: React.FC<CharacterShellProps> = React.memo(
  ({
    x,
    y,
    isJumping,
    isRunning,
    isGameOver,
    onClick,
    showHitbox,
    bottomOffset,
    Art,
  }) => {
    // Параметры хитбокса (должны соответствовать логике проверки столкновений)
    const hitboxWidth = GAME_CONSTANTS.BEAR_WIDTH - 15;
    const hitboxHeight = GAME_CONSTANTS.BEAR_HEIGHT - 24;
    const hitboxXOffset = 7;
    const hitboxYOffset = 4;

    return (
      <div
        className={`${styles.character} ${
          isJumping ? styles.jumping : isRunning ? styles.running : ""
        } ${isGameOver ? styles.characterDead : ""}`}
        style={{
          left: `${x}px`,
          bottom: `${y + GAME_CONSTANTS.GROUND_HEIGHT / 2 + bottomOffset}px`,
          width: `${GAME_CONSTANTS.BEAR_WIDTH}px`,
          height: `${GAME_CONSTANTS.BEAR_HEIGHT}px`,
        }}
        onClick={onClick}
      >
        {showHitbox && (
          <div
            className={styles.hitbox}
            style={{
              left: `${hitboxXOffset}px`,
              bottom: `${hitboxYOffset}px`,
              width: `${hitboxWidth}px`,
              height: `${hitboxHeight}px`,
            }}
          />
        )}
        <Art isJumping={isJumping} isRunning={isRunning} />
      </div>
    );
  }
);

export default CharacterShell;
