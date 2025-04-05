import React from "react";
import { Text } from "@consta/uikit/Text";
import styles from "./EsoGame.module.css";

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  coins: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = React.memo(
  ({ score, highScore, coins }) => {
    return (
      <div className={styles.scoreDisplay}>
        <Text size="s" view="secondary">
          Очки: {score}
        </Text>
        <Text size="s" view="secondary">
          Монетки: {coins}
        </Text>
        <Text size="s" view="secondary">
          Рекорд: {highScore}
        </Text>
      </div>
    );
  }
);

export default ScoreDisplay;
