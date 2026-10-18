// constants.ts
export const GAME_CONSTANTS = {
  BEAR_WIDTH: 45,
  BEAR_HEIGHT: 65,
  BARREL_WIDTH: 40,
  BARREL_HEIGHT: 40,
  COIN_SIZE: 20,
  COIN_POINTS: 5,
  GROUND_HEIGHT: 40,
  GAME_WIDTH: 720,
  GAME_HEIGHT: 400,
  JUMP_VELOCITY: 10.5,
  GRAVITY: 0.35, // гравитация при подъёме (вершина ~157px естественно, без клампа)
  FALL_GRAVITY: 0.45, // гравитация при падении (мягкий спуск)
  HANG_GRAVITY: 0.08, // гравитация у вершины прыжка — «зависание» в воздухе
  HANG_THRESHOLD: 1.0, // при |скорости| ниже порога включается зависание
  JUMP_HEIGHT: 170, // страховочный предел (не срабатывает при обычном прыжке)
  JUMP_CUT_VELOCITY: 1, // при отпускании клавиши скорость подъёма ограничивается (чёткий низкий прыжок)
  INITIAL_GAME_SPEED: 2,
  MAX_GAME_SPEED: 10,
};
export const BONUS_WIDTH = 40;
export const BONUS_HEIGHT = 40;
export const BONUS_POINTS = 20;
