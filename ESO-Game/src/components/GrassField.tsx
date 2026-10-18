import React, { useMemo } from "react";
import { GrassBlade } from "./types";
import { GAME_CONSTANTS } from "./constants";
import styles from "./EsoGame.module.css";
const GrassField = React.memo(
  ({
    grass,
    windForce,
    parallaxOffset,
    isNight,
  }: {
    grass: GrassBlade[];
    windForce: number;
    parallaxOffset: number;
    isNight: boolean;
  }) => {
    // Группируем траву по слоям
    const layers = useMemo(() => {
      return grass.reduce(
        (acc, blade) => {
          if (!acc[blade.layer]) acc[blade.layer] = [];
          acc[blade.layer].push(blade);
          return acc;
        },
        [[] as GrassBlade[], [] as GrassBlade[], [] as GrassBlade[]]
      );
    }, [grass]);

    return (
      <>
        {layers.map((layerGrass, layerIndex) => {
          return (
            <svg
              key={`grass-layer-${layerIndex}`}
              className={styles.grassLayer}
              width={GAME_CONSTANTS.GAME_WIDTH * 1.5}
              height={GAME_CONSTANTS.GROUND_HEIGHT}
              style={{
                bottom: GAME_CONSTANTS.GROUND_HEIGHT - 3,
                left: 0,
                transform: `translate3d(-${parallaxOffset}px, 0, 0)`,
                pointerEvents: "none",
              }}
            >
              {layerGrass.map((blade) => {
                const bottom = GAME_CONSTANTS.GROUND_HEIGHT;
                const top = bottom - blade.height;
                // Наклон от ветра (меняется редко — не каждый кадр)
                const bend = windForce * 10 * (1 - blade.stiffness);
                // Естественный наклон: кончик смещён относительно основания
                const tipX = blade.x + blade.lean * blade.height * 0.7 + bend;
                const ctrlX =
                  blade.x + blade.lean * blade.height * 0.3 + bend * 0.5;
                // Вариация цвета травинки (чтобы не сливались)
                const hue = 90 + layerIndex * 15 + (isNight ? 0 : blade.tone * 20);
                const sat = isNight ? 18 : 55;
                const light =
                  (isNight ? 13 + layerIndex * 2 : 40 + layerIndex * 6) +
                  (isNight ? 0 : blade.tone * 13);

                return (
                  <path
                    key={`grass-${blade.id}`}
                    d={`M${blade.x} ${bottom} Q${ctrlX} ${
                      (bottom + top) / 2
                    } ${tipX} ${top}`}
                    stroke={`hsl(${hue}, ${sat}%, ${light}%)`}
                    strokeWidth={1.4 + blade.height * 0.04}
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          );
        })}
      </>
    );
  }
);
export default GrassField;
