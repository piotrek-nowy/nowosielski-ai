import { Card, CardLocation, DropTarget, GameState } from './types';
import { RANK_VALUES } from './constants';

export function getColor(suit: Card['suit']): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function canPlaceOnTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) {
    return card.rank === 'K';
  }
  const topCard = column[column.length - 1];
  if (!topCard.faceUp) return false;
  return (
    getColor(card.suit) !== getColor(topCard.suit) &&
    RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] - 1
  );
}

export function canPlaceOnFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) {
    return card.rank === 'A';
  }
  const topCard = pile[pile.length - 1];
  return card.suit === topCard.suit && RANK_VALUES[card.rank] === RANK_VALUES[topCard.rank] + 1;
}

export function getCardsToMove(state: GameState, from: CardLocation): Card[] | null {
  switch (from.pile) {
    case 'tableau': {
      const column = state.tableau[from.index];
      if (from.cardIndex < 0 || from.cardIndex >= column.length) return null;
      if (!column[from.cardIndex].faceUp) return null;
      return column.slice(from.cardIndex);
    }
    case 'waste': {
      if (state.waste.length === 0) return null;
      return [state.waste[state.waste.length - 1]];
    }
    case 'foundation': {
      const pile = state.foundation[from.index];
      if (pile.length === 0) return null;
      return [pile[pile.length - 1]];
    }
    default:
      return null;
  }
}

export function isValidMove(
  state: GameState,
  from: CardLocation,
  to: DropTarget
): boolean {
  const cards = getCardsToMove(state, from);
  if (!cards || cards.length === 0) return false;

  if (to.pile === 'foundation') {
    if (cards.length > 1) return false;
    return canPlaceOnFoundation(cards[0], state.foundation[to.index]);
  }

  if (to.pile === 'tableau') {
    return canPlaceOnTableau(cards[0], state.tableau[to.index]);
  }

  return false;
}

export function checkWin(state: GameState): boolean {
  return state.foundation.every(pile => pile.length === 13);
}

export function canAutoComplete(state: GameState): boolean {
  if (state.stock.length > 0 || state.waste.length > 0) return false;
  return state.tableau.every(col => col.every(card => card.faceUp));
}

export function findAutoFoundationMove(
  state: GameState
): { from: CardLocation; to: DropTarget } | null {
  const sources: CardLocation[] = [];

  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];
    if (column.length > 0) {
      sources.push({ pile: 'tableau', index: col, cardIndex: column.length - 1 });
    }
  }

  if (state.waste.length > 0) {
    sources.push({ pile: 'waste', index: 0, cardIndex: state.waste.length - 1 });
  }

  for (const from of sources) {
    for (let f = 0; f < 4; f++) {
      if (isValidMove(state, from, { pile: 'foundation', index: f })) {
        return { from, to: { pile: 'foundation', index: f } };
      }
    }
  }

  return null;
}

export function findAllValidMoves(
  state: GameState
): Array<{ from: CardLocation; to: DropTarget }> {
  const moves: Array<{ from: CardLocation; to: DropTarget }> = [];

  if (state.waste.length > 0) {
    const wasteFrom: CardLocation = {
      pile: 'waste',
      index: 0,
      cardIndex: state.waste.length - 1,
    };
    for (let f = 0; f < 4; f++) {
      if (isValidMove(state, wasteFrom, { pile: 'foundation', index: f })) {
        moves.push({ from: wasteFrom, to: { pile: 'foundation', index: f } });
      }
    }
    for (let i = 0; i < 7; i++) {
      if (isValidMove(state, wasteFrom, { pile: 'tableau', index: i })) {
        moves.push({ from: wasteFrom, to: { pile: 'tableau', index: i } });
      }
    }
  }

  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];
    for (let cardIdx = 0; cardIdx < column.length; cardIdx++) {
      if (!column[cardIdx].faceUp) continue;
      const from: CardLocation = { pile: 'tableau', index: col, cardIndex: cardIdx };

      if (cardIdx === column.length - 1) {
        for (let f = 0; f < 4; f++) {
          if (isValidMove(state, from, { pile: 'foundation', index: f })) {
            moves.push({ from, to: { pile: 'foundation', index: f } });
          }
        }
      }

      for (let targetCol = 0; targetCol < 7; targetCol++) {
        if (targetCol === col) continue;
        if (isValidMove(state, from, { pile: 'tableau', index: targetCol })) {
          // Skip moves that don't accomplish anything (moving a King to empty column from base)
          if (column[cardIdx].rank === 'K' && cardIdx === 0 && state.tableau[targetCol].length === 0) {
            continue;
          }
          moves.push({ from, to: { pile: 'tableau', index: targetCol } });
        }
      }
    }
  }

  return moves;
}
