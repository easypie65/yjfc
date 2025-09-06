import type { Player, Position } from './types';

export const GOAL_WIDTH = 6;
export const GOAL_POST_LEFT: Position = { x: -GOAL_WIDTH / 2, y: 0 };
export const GOAL_POST_RIGHT: Position = { x: GOAL_WIDTH / 2, y: 0 };

// ViewBox for the SVG: min-x, min-y, width, height
export const VIEWBOX = {
  minX: -15,
  minY: -5,
  width: 30,
  height: 25,
};

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: '선수 1', color: 'bg-red-500', position: { x: -6, y: 4 } },
  { id: 2, name: '선수 2', color: 'bg-blue-500', position: { x: 0, y: 6 } },
  { id: 3, name: '선수 3', color: 'bg-yellow-400', position: { x: 9, y: 8 } },
];
