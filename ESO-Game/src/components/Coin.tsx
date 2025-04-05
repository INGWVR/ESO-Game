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
        top: `${y}px`,
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
      <svg width={GAME_CONSTANTS.COIN_SIZE} height={GAME_CONSTANTS.COIN_SIZE}>
        <circle
          cx={GAME_CONSTANTS.COIN_SIZE / 2}
          cy={GAME_CONSTANTS.COIN_SIZE / 2}
          r={GAME_CONSTANTS.COIN_SIZE / 2}
          fill="gold"
        />
        <circle
          cx={GAME_CONSTANTS.COIN_SIZE / 2}
          cy={GAME_CONSTANTS.COIN_SIZE / 2}
          r={GAME_CONSTANTS.COIN_SIZE / 3}
          fill="orange"
        />
      </svg>
    </div>
  );
});

export default Coin;
