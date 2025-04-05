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
        bottom: `${GAME_CONSTANTS.GROUND_HEIGHT}px`,
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
        viewBox="0 0 511.999 511.999"
        preserveAspectRatio="xMidYMin meet"
        width="100%"
        height="100%"
      >
        <g>
          <polygon
            fill="#AFB6BB"
            points="464.159,458.533 464.159,503.541 47.84,503.541 47.84,458.533 87.221,458.533 424.776,458.533"
          ></polygon>
          <polygon
            fill="#AFB6BB"
            points="464.159,233.496 464.159,278.504 424.776,278.504 87.221,278.504 47.84,278.504 47.84,233.496 87.221,233.496 424.776,233.496"
          ></polygon>
          <polygon
            fill="#AFB6BB"
            points="464.159,8.459 464.159,53.466 424.776,53.466 87.221,53.466 47.84,53.466 47.84,8.459"
          ></polygon>
          <rect
            x="87.218"
            y="278.508"
            fill="#546A79"
            width="337.553"
            height="180.033"
          ></rect>
          <rect
            x="87.218"
            y="53.462"
            fill="#546A79"
            width="337.553"
            height="180.033"
          ></rect>
          <rect
            x="87.218"
            y="53.462"
            fill="#425562"
            width="168.776"
            height="180.033"
          ></rect>
          <rect
            x="87.218"
            y="278.508"
            fill="#425562"
            width="168.776"
            height="180.033"
          ></rect>
          <path
            fill="#000000"
            d="M472.617,61.925V0H137.85v16.918h317.849v28.089H56.299V16.918h59.051V0h-75.97v61.925h39.382v163.111H39.381v61.925h39.382 v163.111H39.381v61.926h433.237v-61.926h-39.381v-59.051h-16.918v59.051H95.681V326.344h244.708v-16.918H95.681v-22.464h320.637 v81.556h16.918v-81.556h39.381v-61.925h-39.381V61.925H472.617z M455.698,495.082H56.299v-28.09h399.4v28.09H455.698z M455.698,270.044H56.299v-28.089h399.4v28.089H455.698z M416.317,225.036H95.681V101.308h244.708V84.389H95.681V61.925h320.637 L416.317,225.036L416.317,225.036z"
          ></path>
          <rect
            x="357.267"
            y="84.389"
            fill="#000000"
            width="28.129"
            height="16.918"
          ></rect>
          <rect
            x="357.267"
            y="309.423"
            fill="#000000"
            width="28.129"
            height="16.918"
          ></rect>
          <polygon
            fill="#FFFFFF"
            points="118.143,177.237 135.062,177.237 135.062,140.689 165.985,140.689 165.985,123.77 118.143,123.77"
          ></polygon>
          <polygon
            fill="#FFFFFF"
            points="135.062,402.274 135.062,365.725 165.985,365.725 165.985,348.807 118.143,348.807 118.143,402.274"
          ></polygon>
          <rect
            x="374.14"
            y="185.649"
            fill="#FFFFFF"
            width="22.504"
            height="16.918"
          ></rect>
          <rect
            x="374.14"
            y="410.696"
            fill="#FFFFFF"
            width="22.504"
            height="16.918"
          ></rect>
        </g>
      </svg>
    </div>
  );
});

export default Barrel;
