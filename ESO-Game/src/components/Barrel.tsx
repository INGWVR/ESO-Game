import React from "react";
import styles from "./EsoGame.module.css";
import { GAME_CONSTANTS } from "./constants";

interface BarrelProps {
  x: number;
  showHitbox?: boolean;
}

const Barrel: React.FC<BarrelProps> = React.memo(({ x, showHitbox }) => {
  const hitboxWidth = GAME_CONSTANTS.BARREL_WIDTH - 10;
  const hitboxHeight = GAME_CONSTANTS.BARREL_HEIGHT - 10;
  const hitboxXOffset = 5;
  const hitboxYOffset = 0;
  return (
    <div
      className={styles.barrelContainer}
      style={{
        left: `${x}px`,
        bottom: `${GAME_CONSTANTS.GROUND_HEIGHT / 2 - 4}px`,
        width: `${GAME_CONSTANTS.BARREL_WIDTH}px`,
        height: `${GAME_CONSTANTS.BARREL_HEIGHT}px`,
      }}
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
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
      >
        {/* Корпус бочки (выпуклые бока) — во всю высоту, чтобы стоять на земле */}
        <path
          d="M22 0 C 8 32, 8 68, 22 100 L 78 100 C 92 68, 92 32, 78 0 Z"
          fill="#9c672e"
        />
        {/* Клёпки (вертикальные доски) */}
        <path
          d="M35 0 C 28 32, 28 68, 35 100"
          stroke="#5e3a16"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M50 0 C 45 34, 45 66, 50 100"
          stroke="#5e3a16"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M65 0 C 72 32, 72 68, 65 100"
          stroke="#5e3a16"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Обручи (металлические кольца) */}
        <path
          d="M19 28 C 34 35, 66 35, 81 28 L 81 36 C 66 43, 34 43, 19 36 Z"
          fill="#7e858b"
        />
        <path
          d="M19 68 C 34 75, 66 75, 81 68 L 81 76 C 66 83, 34 83, 19 76 Z"
          fill="#7e858b"
        />
        {/* Блик на дереве */}
        <path
          d="M28 6 C 15 36, 15 64, 28 94"
          stroke="#c8924a"
          strokeWidth="6"
          opacity="0.55"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
});

export default Barrel;
