import React from "react";
import styles from "./EsoGame.module.css";

interface StarProps {
  x: number;
  y: number;
  size: number;
  id: number;
}

const Star: React.FC<StarProps> = React.memo(({ x, y, size, id }) => {
  return (
    <div
      className={styles.star}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${(id % 10) * 0.2}s`,
      }}
    />
  );
});

export default Star;
