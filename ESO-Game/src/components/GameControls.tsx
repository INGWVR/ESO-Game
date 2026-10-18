import React from "react";
import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { IconRestart } from "@consta/icons/IconRestart";
import { IconArrowUp } from "@consta/icons/IconArrowUp";
import styles from "./EsoGame.module.css";
import { CharacterType } from "./types";
import { CHARACTERS } from "./characters";

interface GameControlsProps {
  gameState: "idle" | "running" | "gameOver";
  onStartGame: () => void;
  score: number;
  characterType: CharacterType;
  onSelectCharacter: (type: CharacterType) => void;
}

const GameControls: React.FC<GameControlsProps> = React.memo(
  ({ gameState, onStartGame, score, characterType, onSelectCharacter }) => {
    return (
      <div className={styles.gameControls}>
        {gameState === "gameOver" ? (
          <>
            <Text size="xl" weight="bold" view="primary">
              Игра окончена!
            </Text>
            <Text size="l" weight="bold" view="primary">
              Ваш счёт: {score}
            </Text>
            <Text size="xs" view="secondary">
              Нажмите Пробел, чтобы сыграть снова
            </Text>
            <Button
              label="Играть снова"
              iconRight={IconRestart}
              onClick={onStartGame}
              size="s"
              view="primary"
            />
          </>
        ) : (
          <>
            <Text size="xl" weight="bold" view="primary">
              Косолапый забег
            </Text>
            <Text size="s" view="secondary">
              Собирай монетки и перепрыгивай бочки
            </Text>
            <div className={styles.characterSelect}>
              {CHARACTERS.map((c) => (
                <Button
                  key={c.id}
                  label={`${c.emoji} ${c.label}`}
                  size="s"
                  view={characterType === c.id ? "primary" : "ghost"}
                  onClick={() => onSelectCharacter(c.id)}
                />
              ))}
            </div>
            <Text size="xs" view="secondary">
              Нажмите <IconArrowUp size="s" /> или Пробел, чтобы начать
            </Text>
            <Button
              label="Начать игру"
              onClick={onStartGame}
              size="s"
              view="primary"
            />
          </>
        )}
      </div>
    );
  }
);

export default GameControls;
