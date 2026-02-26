import { Suit, Rank } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#e53935',
  diamonds: '#e53935',
  clubs: '#1a1a1a',
  spades: '#1a1a1a',
};

export const RANK_VALUES: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
};

export const FOUNDATION_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const INITIAL_UNDOS = 10;
export const INITIAL_HINTS = 10;

export const CARD_WIDTH = 90;
export const CARD_HEIGHT = 126;
export const TABLEAU_FACE_DOWN_OFFSET = 22;
export const TABLEAU_FACE_UP_OFFSET = 32;

export const SCORING = {
  WASTE_TO_TABLEAU: 5,
  WASTE_TO_FOUNDATION: 10,
  TABLEAU_TO_FOUNDATION: 10,
  REVEAL_CARD: 5,
  FOUNDATION_TO_TABLEAU: -15,
  RECYCLE_STOCK: -20,
  UNDO: -10,
};
