
export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  position: Position;
}

export type HighlightedTriangle = {
  playerId: number;
  side: 'left' | 'right';
} | null;

export type Activity = 'activity1' | 'activity2';

export interface CalculationStep {
  numerator: number;
  denominator: number;
  tangent: number;
  angleDeg: number;
}

export interface CalculationData {
  [playerId: number]: {
    left: CalculationStep;
    right: CalculationStep;
    finalAngle: number;
    isSum: boolean;
  } | null;
}

export interface PlayerCompletionStatus {
  left: boolean;
  right: boolean;
}

export interface CompletionStatus {
  [playerId: number]: PlayerCompletionStatus;
}