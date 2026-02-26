export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'red' | 'black';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export type PileType = 'tableau' | 'foundation' | 'stock' | 'waste';

export interface CardLocation {
  pile: PileType;
  index: number;
  cardIndex: number;
}

export interface DropTarget {
  pile: PileType;
  index: number;
}

export interface GameState {
  tableau: Card[][];
  foundation: Card[][];
  stock: Card[];
  waste: Card[];
  score: number;
  moves: number;
  drawMode: 1 | 3;
  history: GameSnapshot[];
  undosRemaining: number;
  hintsRemaining: number;
  gameStatus: 'idle' | 'playing' | 'paused' | 'won';
  stockRecycles: number;
  timeElapsed: number;
}

export interface GameSnapshot {
  tableau: Card[][];
  foundation: Card[][];
  stock: Card[];
  waste: Card[];
  score: number;
  moves: number;
  stockRecycles: number;
}

export type GameAction =
  | { type: 'DEAL' }
  | { type: 'DRAW_STOCK' }
  | { type: 'RECYCLE_WASTE' }
  | { type: 'MOVE_CARDS'; from: CardLocation; to: DropTarget }
  | { type: 'UNDO' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_DRAW_MODE'; mode: 1 | 3 }
  | { type: 'TICK' }
  | { type: 'NEW_GAME' }
  | { type: 'AUTO_COMPLETE_STEP' };

export interface DragInfo {
  cards: Card[];
  source: CardLocation;
}

export interface HintMove {
  from: CardLocation;
  to: DropTarget;
}
