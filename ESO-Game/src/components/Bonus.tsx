import React from "react";
import styles from "./EsoGame.module.css";
import { BONUS_WIDTH, BONUS_HEIGHT } from "./constants";

interface BonusProps {
  x: number;
  y: number;
  type: "gazprom";
  showHitbox?: boolean;
}

const Bonus: React.FC<BonusProps> = React.memo(
  ({ x, y, type, showHitbox = false }) => {
    return (
      <div
        className={styles.bonus}
        style={{
          left: `${x}px`,
          bottom: `${y}px`,
          width: `${BONUS_WIDTH}px`,
          height: `${BONUS_HEIGHT}px`,
        }}
      >
        {showHitbox && (
          <div
            className={styles.hitbox}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
        {type === "gazprom" && (
          <svg viewBox="0 0 150 150">
            <path d="M0 0h150v150H0V0z" fill="none" />
            <path
              fill="var(--color-bg-soft)"
              d="M106 24.7C103.1 12 95.9 1.7 94.9 0 90.5 6.7 87 13.9 84.6 21.6c-2.9 10.1-3.8 20.7-2.6 31.1.9 6.8 2.7 13.5 5.2 19.9 2 4.9 4.6 9.5 7.7 13.8 3.2-4.1 10.4-16.3 12.7-32.3 1.3-9 1.3-16.8-1.6-29.4zM94.9 83.2c-2.5-4.8-3.8-10.2-3.8-15.7 0-5.4 1.3-10.7 3.9-15.5 2.3 4.6 3.6 9.7 3.8 14.8 0 5.7-1.3 11.3-3.9 16.4zm10.3-37c0 4.4-.5 8.7-1.4 13 .2-6.2-.3-12.4-1.6-18.5-1.2-5.8-4.6-15.5-7.4-19.9-2.5 4.2-5.6 12.6-7.3 19.9-1.2 6.1-1.7 12.4-1.7 18.7-1-6-1.4-12-1.2-18.1.3-5.5 1.2-11 2.6-16.4 1.9-6.3 4.4-12.3 7.5-18 3.3 5.6 5.8 11.6 7.6 17.8 2.1 6.9 3 14.2 2.9 21.5"
            />
            <path
              fill="var(--color-bg-soft)"
              d="M99.8 89.3h-22V104s.1 0 .1-.1c5.2-5.1 13.6-5.1 18.8.2 5.1 5.2 5.1 13.4 0 18.6l-.1.1-.1.1c-10.5 10.2-27.3 10-37.5-.4-8.8-8.9-10.1-22.8-3.2-33.2 1-1.4 2-2.8 3.3-4 5-5 11.7-7.8 18.8-7.8V42.1c-26.1 0-47.2 21.1-47.2 47.2s21.1 47.2 47.2 47.2c13.1 0 25.5-5.4 34.5-14.9V89.3H99.8"
            />
          </svg>
        )}
      </div>
    );
  }
);

export default Bonus;
