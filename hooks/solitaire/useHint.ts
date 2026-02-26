import { useCallback } from 'react';
import { GameState, HintMove, CardLocation } from '@/lib/solitaire/types';
import { isValidMove } from '@/lib/solitaire/moves';
import { RANK_VALUES } from '@/lib/solitaire/constants';

/**
 * Priority: foundation moves > moves that reveal face-down cards > waste moves > other tableau moves
 */
function findBestHint(state: GameState): HintMove | null {
  // 1. Tableau top cards → foundation
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];
    if (column.length === 0) continue;
    const from: CardLocation = { pile: 'tableau', index: col, cardIndex: column.length - 1 };
    for (let f = 0; f < 4; f++) {
      if (isValidMove(state, from, { pile: 'foundation', index: f })) {
        return { from, to: { pile: 'foundation', index: f } };
      }
    }
  }

  // 2. Waste → foundation
  if (state.waste.length > 0) {
    const from: CardLocation = { pile: 'waste', index: 0, cardIndex: state.waste.length - 1 };
    for (let f = 0; f < 4; f++) {
      if (isValidMove(state, from, { pile: 'foundation', index: f })) {
        return { from, to: { pile: 'foundation', index: f } };
      }
    }
  }

  // 3. Tableau moves that reveal face-down cards
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];
    const firstFaceUp = column.findIndex(c => c.faceUp);
    if (firstFaceUp <= 0) continue; // No face-down cards to reveal

    const from: CardLocation = { pile: 'tableau', index: col, cardIndex: firstFaceUp };
    for (let target = 0; target < 7; target++) {
      if (target === col) continue;
      if (isValidMove(state, from, { pile: 'tableau', index: target })) {
        return { from, to: { pile: 'tableau', index: target } };
      }
    }
  }

  // 4. Waste → tableau
  if (state.waste.length > 0) {
    const from: CardLocation = { pile: 'waste', index: 0, cardIndex: state.waste.length - 1 };
    for (let i = 0; i < 7; i++) {
      if (isValidMove(state, from, { pile: 'tableau', index: i })) {
        return { from, to: { pile: 'tableau', index: i } };
      }
    }
  }

  // 5. Any remaining tableau → tableau (prefer moves that build longer sequences)
  let bestMove: HintMove | null = null;
  let bestScore = -1;

  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col];
    for (let ci = 0; ci < column.length; ci++) {
      if (!column[ci].faceUp) continue;
      const from: CardLocation = { pile: 'tableau', index: col, cardIndex: ci };
      const stackSize = column.length - ci;

      for (let target = 0; target < 7; target++) {
        if (target === col) continue;
        if (!isValidMove(state, from, { pile: 'tableau', index: target })) continue;
        // Skip king-to-empty-column if it's already at the base
        if (column[ci].rank === 'K' && ci === 0 && state.tableau[target].length === 0) continue;

        const score = stackSize + RANK_VALUES[column[ci].rank];
        if (score > bestScore) {
          bestScore = score;
          bestMove = { from, to: { pile: 'tableau', index: target } };
        }
      }
    }
  }

  if (bestMove) return bestMove;

  // 6. If stock has cards, suggest drawing
  if (state.stock.length > 0) {
    return {
      from: { pile: 'stock', index: 0, cardIndex: 0 },
      to: { pile: 'waste', index: 0 },
    };
  }

  return null;
}

export function useHint(state: GameState) {
  const getHint = useCallback((): HintMove | null => {
    return findBestHint(state);
  }, [state]);

  return { getHint };
}
