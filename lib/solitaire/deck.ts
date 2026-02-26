import { Card } from './types';
import { SUITS, RANKS } from './constants';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[]): {
  tableau: Card[][];
  stock: Card[];
} {
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let cardIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[cardIndex] };
      card.faceUp = row === col;
      tableau[col].push(card);
      cardIndex++;
    }
  }

  const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }));
  return { tableau, stock };
}
