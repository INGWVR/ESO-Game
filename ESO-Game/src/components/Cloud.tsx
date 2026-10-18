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
        <circle cx="30" cy="38" r="18" fill="rgba(255,255,255,0.95)" />
        <circle cx="50" cy="26" r="24" fill="rgba(255,255,255,0.95)" />
        <circle cx="72" cy="36" r="16" fill="rgba(255,255,255,0.95)" />
        <rect x="28" y="36" width="46" height="16" rx="8" fill="rgba(255,255,255,0.95)" />
        {/* Тень снизу для объёма */}
        <rect x="28" y="44" width="46" height="8" rx="4" fill="rgba(160,180,200,0.25)" />
      </svg>
    </div>
  );
});

export default Cloud;
