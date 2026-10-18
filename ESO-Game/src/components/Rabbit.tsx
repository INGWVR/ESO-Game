import React from "react";
import styles from "./EsoGame.module.css";
import { CharacterArtProps } from "./CharacterShell";

export const RabbitArt: React.FC<CharacterArtProps> = ({ isJumping, isRunning }) => (
  <svg
    viewBox="0 0 206 236"
    preserveAspectRatio="xMidYMin meet"
    width="100%"
    height="100%"
  >
    {/* Уши (длинные) */}
    <g>
      <ellipse
        cx="62"
        cy="42"
        rx="18"
        ry="42"
        fill="#dcc9ab"
        transform="rotate(-10 62 42)"
      />
      <ellipse
        cx="62"
        cy="42"
        rx="8"
        ry="30"
        fill="#f7c8d4"
        transform="rotate(-10 62 42)"
      />
      <ellipse
        cx="144"
        cy="42"
        rx="18"
        ry="42"
        fill="#dcc9ab"
        transform="rotate(10 144 42)"
      />
      <ellipse
        cx="144"
        cy="42"
        rx="8"
        ry="30"
        fill="#f7c8d4"
        transform="rotate(10 144 42)"
      />
    </g>
    {/* Голова */}
    <ellipse cx="103" cy="110" rx="58" ry="50" fill="#eadbc2" />
    {/* Глаза */}
    <circle cx="82" cy="100" r="9" fill="#3a3a3a" />
    <circle cx="124" cy="100" r="9" fill="#3a3a3a" />
    <circle cx="85" cy="97" r="3" fill="#ffffff" />
    <circle cx="127" cy="97" r="3" fill="#ffffff" />
    {/* Нос */}
    <ellipse cx="103" cy="120" rx="6" ry="4.5" fill="#f39fb3" />
    {/* Рот */}
    <path
      d="M103 125 Q 96 134 90 127 M103 125 Q 110 134 116 127"
      stroke="#3a3a3a"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Усы */}
    <path
      d="M82 120 L66 116 M82 125 L64 128 M124 120 L140 116 M124 125 L142 128"
      stroke="#3a3a3a"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Тело */}
    <ellipse cx="103" cy="168" rx="52" ry="38" fill="#eadbc2" />
    {/* Задние лапы */}
    <ellipse
      className={`${styles.backLeg} ${
        !isJumping && isRunning ? styles.runningLeg : ""
      } ${isJumping ? styles.jumpingLeg : ""}`}
      cx="72"
      cy="223"
      rx="20"
      ry="13"
      fill="#d4b48c"
      stroke="#c9ab7d"
      strokeWidth="1.5"
    />
    <ellipse
      className={`${styles.backLeg} ${
        !isJumping && isRunning ? styles.runningLeg : ""
      } ${isJumping ? styles.jumpingLeg : ""}`}
      cx="134"
      cy="223"
      rx="20"
      ry="13"
      fill="#d4b48c"
      stroke="#c9ab7d"
      strokeWidth="1.5"
    />
    {/* Передние лапы */}
    <ellipse
      className={`${styles.frontLeg} ${
        !isJumping && isRunning ? styles.runningLeg : ""
      } ${isJumping ? styles.jumpFrontLeft : ""}`}
      cx="86"
      cy="198"
      rx="12"
      ry="8"
      fill="#d4b48c"
      stroke="#c9ab7d"
      strokeWidth="1.5"
    />
    <ellipse
      className={`${styles.frontLeg} ${
        !isJumping && isRunning ? styles.runningLeg : ""
      } ${isJumping ? styles.jumpFrontRight : ""}`}
      cx="120"
      cy="198"
      rx="12"
      ry="8"
      fill="#d4b48c"
      stroke="#c9ab7d"
      strokeWidth="1.5"
    />
  </svg>
);
