import React from "react";
import styles from "./EsoGame.module.css";
import { GAME_CONSTANTS } from "./constants";

interface CoinProps {
  x: number;
  y: number;
  hitboxVisible?: boolean;
}

const Coin: React.FC<CoinProps> = React.memo(({ x, y, hitboxVisible }) => {
  const COIN_HITBOX_OFFSET = 8;
  return (
    <div
      className={styles.coin}
      style={{
        left: `${x}px`,
        bottom: `${y + GAME_CONSTANTS.GROUND_HEIGHT}px`,
        width: `${GAME_CONSTANTS.COIN_SIZE}px`,
        height: `${GAME_CONSTANTS.COIN_SIZE}px`,
      }}
    >
      {hitboxVisible && (
        <div
          className={styles.hitbox}
          style={{
            left: `-${COIN_HITBOX_OFFSET / 2}px`,
            bottom: `-${COIN_HITBOX_OFFSET / 2}px`,
            width: `${GAME_CONSTANTS.COIN_SIZE + COIN_HITBOX_OFFSET}px`,
            height: `${GAME_CONSTANTS.COIN_SIZE + COIN_HITBOX_OFFSET}px`,
          }}
        />
      )}
      {/* Ребро монеты (толщина, видно при повороте) */}
      <div className={styles.coinEdge} />
      {/* Лицевая сторона */}
      <div className={styles.coinFace}>
        <svg width={GAME_CONSTANTS.COIN_SIZE} height={GAME_CONSTANTS.COIN_SIZE}>
          {/* Ободок */}
          <circle cx="10" cy="10" r="10" fill="#c98a00" />
          {/* Лицевая сторона */}
          <circle cx="10" cy="10" r="8.5" fill="#ffd54d" />
          {/* Внутреннее кольцо */}
          <circle
            cx="10"
            cy="10"
            r="6"
            fill="none"
            stroke="#c98a00"
            strokeWidth="1"
          />
          {/* Блик */}
          <ellipse
            cx="6.5"
            cy="5"
            rx="3"
            ry="2"
            fill="rgba(255,255,255,0.85)"
          />
          {/* Звезда */}
          <path
            d="M10 4.5 L11.6 8 L15.3 8.5 L12.6 11.2 L13.2 14.7 L10 12.9 L6.8 14.7 L7.4 11.2 L4.7 8.5 L8.4 8 Z"
            fill="#c98a00"
          />
        </svg>
      </div>
    </div>
  );
});

export default Coin;
