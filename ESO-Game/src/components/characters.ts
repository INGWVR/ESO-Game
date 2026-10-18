import type { ComponentType } from "react";
import { CharacterType } from "./types";
import { CharacterArtProps } from "./CharacterShell";
import { BearArt } from "./Bear";
import { RabbitArt } from "./Rabbit";

export interface CharacterConfig {
  id: CharacterType;
  label: string;
  emoji: string;
  Art: ComponentType<CharacterArtProps>;
  /** Сдвиг персонажа по вертикали относительно земли (учитывает особенности арта). */
  bottomOffset: number;
  /** Ширина тени под персонажем в px. */
  shadowWidth: number;
  /** Смещение тени влево для центрирования под персонажем, px. */
  shadowLeftOffset: number;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: "bear",
    label: "Мишка",
    emoji: "🐻",
    Art: BearArt,
    bottomOffset: -4,
    shadowWidth: 35,
    shadowLeftOffset: 5,
  },
  {
    id: "rabbit",
    label: "Кролик",
    emoji: "🐰",
    Art: RabbitArt,
    bottomOffset: -9,
    shadowWidth: 26,
    shadowLeftOffset: 9,
  },
];

export function getCharacter(id: CharacterType): CharacterConfig {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
