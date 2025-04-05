import React, { useMemo } from "react";
import { GrassBlade } from "./types";
import { GAME_CONSTANTS } from "./constants";
import styles from "./EsoGame.module.css";
const GrassField = React.memo(
  ({
    grass,
    offset,
    windForce,
    parallaxOffset,
  }: {
    grass: GrassBlade[];
    offset: number;
    windForce: number;
    parallaxOffset: number;
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
          // Разные слои двигаются с разной скоростью (глубже = медленнее)
          const layerOffset = parallaxOffset * (0.3 + layerIndex * 0.2);

          return (
            <svg
              key={`grass-layer-${layerIndex}`}
              className={styles.grassLayer}
              width={GAME_CONSTANTS.GAME_WIDTH * 1.5}
              height={GAME_CONSTANTS.GROUND_HEIGHT}
              style={{
                bottom: GAME_CONSTANTS.GROUND_HEIGHT - 3,
                left: `-${layerOffset}px`,
                pointerEvents: "none",
              }}
            >
              {layerGrass.map((blade) => {
                const bend =
                  Math.sin(offset * blade.speed + blade.x * 0.03) * 3;
                const windEffect = windForce * 15 * (1 - blade.stiffness);
                const totalBend = bend + windEffect;

                return (
                  <path
                    key={`grass-${blade.id}`}
                    d={`M${blade.x} ${GAME_CONSTANTS.GROUND_HEIGHT} 
                      Q${blade.x + totalBend} ${
                      GAME_CONSTANTS.GROUND_HEIGHT - blade.height / 2
                    } 
                      ${blade.x} ${
                      GAME_CONSTANTS.GROUND_HEIGHT - blade.height
                    }`}
                    stroke={`hsl(${100 + layerIndex * 20}, 60%, 50%)`}
                    strokeWidth={1 + blade.height * 0.05}
                    fill="none"
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
