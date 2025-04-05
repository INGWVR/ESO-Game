import React from "react";
import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { IconRestart } from "@consta/icons/IconRestart";
import { IconArrowUp } from "@consta/icons/IconArrowUp";
import styles from "./EsoGame.module.css";

interface GameControlsProps {
  gameState: "idle" | "running" | "gameOver";
  onStartGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = React.memo(
  ({ gameState, onStartGame }) => {
    return (
      <div className={styles.gameControls}>
        {gameState === "gameOver" ? (
          <>
            <Text
              size="l"
              weight="semibold"
              view="primary"
              className={styles.gameOver}
            >
              Игра окончена!
            </Text>
            <Button
              label="Играть снова"
              iconRight={IconRestart}
              onClick={onStartGame}
              size="s"
              view="secondary"
            />
          </>
        ) : (
          <>
            <Text size="m" weight="semibold" className={styles.startMessage}>
              <div>
                Нажмите <IconArrowUp size="s" /> или Пробел чтобы Начать
              </div>
            </Text>
            <Button label="Начать игру" onClick={onStartGame} size="s" />
          </>
        )}
      </div>
    );
  }
);

export default GameControls;
