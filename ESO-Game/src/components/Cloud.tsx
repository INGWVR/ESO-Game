import React from "react";
import styles from "./EsoGame.module.css";

interface CloudProps {
  x: number;
  y: number;
  width: number;
}

const Cloud: React.FC<CloudProps> = React.memo(({ x, y, width }) => {
  return (
    <div
      className={styles.cloud}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
      }}
    >
      <svg viewBox="0 0 100 60" preserveAspectRatio="none">
        <path
          d="M20,40 Q30,20 50,20 Q70,20 80,40 Q90,30 100,40 Q90,50 80,50 Q70,60 50,60 Q30,60 20,50 Z"
          fill="rgba(255,255,255,0.8)"
        />
      </svg>
    </div>
  );
});

export default Cloud;
