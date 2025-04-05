export type GameState = "idle" | "running" | "gameOver";

export interface Position {
  x: number;
  y: number;
}

export interface Barrel {
  id: number;
  x: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  collected?: boolean;
}

export interface Cloud {
  id: number;
  x: number;
  y: number;
  speed: number;
  width: number;
}

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface GrassBlade {
  id: number;
  x: number;
  height: number;
  stiffness: number;
  speed: number;
  layer: number;
}
// types.ts
export interface Bonus {
  id: number;
  x: number;
  y: number;
  collected?: boolean;
  type: "gazprom"; // можно расширить для других бонусов
}
