import React from "react";
import styles from "./EsoGame.module.css";
import { Bird } from "./types";

const BirdComponent: React.FC<Bird> = React.memo(({ x, y, size }) => (
  <svg
    className={styles.bird}
    viewBox="0 0 24 12"
    width={size}
    height={size * 0.5}
    style={{ left: `${x}px`, top: `${y}px` }}
    aria-hidden="true"
  >
    <path
      d="M2 9 Q6 2 12 8 Q18 2 22 9"
      stroke="#4a5a6a"
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
));

export default BirdComponent;
