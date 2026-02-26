import { useReducer, useCallback } from 'react';
import {
  GameState,
  GameAction,
  GameSnapshot,
  Card,
  CardLocation,
} from '@/lib/solitaire/types';
import { createDeck, shuffleDeck, dealCards } from '@/lib/solitaire/deck';
import {
  isValidMove,
  getCardsToMove,
  checkWin,
  canAutoComplete,
  findAutoFoundationMove,
} from '@/lib/solitaire/moves';
import { calculateMoveScore } from '@/lib/solitaire/scoring';
import { INITIAL_UNDOS, INITIAL_HINTS, SCORING } from '@/lib/solitaire/constants';

function cloneCards(cards: Card[]): Card[] {
  return cards.map(c => ({ ...c }));
}

function snapshot(state: GameState): GameSnapshot {
  return {
    tableau: state.tableau.map(cloneCards),
    foundation: state.foundation.map(cloneCards),
    stock: cloneCards(state.stock),
    waste: cloneCards(state.waste),
    score: state.score,
    moves: state.moves,
    stockRecycles: state.stockRecycles,
  };
}

function initialState(drawMode: 1 | 3 = 1): GameState {
  return {
    tableau: [[], [], [], [], [], [], []],
    foundation: [[], [], [], []],
    stock: [],
    waste: [],
    score: 0,
    moves: 0,
    drawMode,
    history: [],
    undosRemaining: INITIAL_UNDOS,
    hintsRemaining: INITIAL_HINTS,
    gameStatus: 'idle',
    stockRecycles: 0,
    timeElapsed: 0,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DEAL': {
      const deck = shuffleDeck(createDeck());
      const { tableau, stock } = dealCards(deck);
      return {
        ...initialState(state.drawMode),
        tableau,
        stock,
        gameStatus: 'playing',
      };
    }

    case 'NEW_GAME':
      return initialState(state.drawMode);

    case 'DRAW_STOCK': {
      if (state.gameStatus !== 'playing' || state.stock.length === 0) return state;
      const snap = snapshot(state);
      const count = Math.min(state.drawMode, state.stock.length);
      const newStock = cloneCards(state.stock);
      const drawn = newStock.splice(-count, count).map(c => ({ ...c, faceUp: true }));
      return {
        ...state,
        stock: newStock,
        waste: [...cloneCards(state.waste), ...drawn],
        moves: state.moves + 1,
        history: [...state.history, snap],
      };
    }

    case 'RECYCLE_WASTE': {
      if (state.gameStatus !== 'playing') return state;
      if (state.waste.length === 0 || state.stock.length > 0) return state;
      const snap = snapshot(state);
      const newStock = [...cloneCards(state.waste)].reverse().map(c => ({ ...c, faceUp: false }));
      const newRecycles = state.stockRecycles + 1;
      const penalty = state.drawMode === 1 && newRecycles > 1 ? SCORING.RECYCLE_STOCK : 0;
      return {
        ...state,
        stock: newStock,
        waste: [],
        stockRecycles: newRecycles,
        score: Math.max(0, state.score + penalty),
        moves: state.moves + 1,
        history: [...state.history, snap],
      };
    }

    case 'MOVE_CARDS': {
      if (state.gameStatus !== 'playing') return state;
      const { from, to } = action;
      if (!isValidMove(state, from, to)) return state;

      const cards = getCardsToMove(state, from);
      if (!cards) return state;

      const snap = snapshot(state);
      const newTableau = state.tableau.map(cloneCards);
      const newFoundation = state.foundation.map(cloneCards);
      const newWaste = cloneCards(state.waste);

      let revealedCard = false;

      switch (from.pile) {
        case 'tableau':
          newTableau[from.index] = newTableau[from.index].slice(0, from.cardIndex);
          if (newTableau[from.index].length > 0) {
            const top = newTableau[from.index][newTableau[from.index].length - 1];
            if (!top.faceUp) {
              top.faceUp = true;
              revealedCard = true;
            }
          }
          break;
        case 'waste':
          newWaste.pop();
          break;
        case 'foundation':
          newFoundation[from.index].pop();
          break;
      }

      const faceUp = cards.map(c => ({ ...c, faceUp: true }));
      switch (to.pile) {
        case 'tableau':
          newTableau[to.index].push(...faceUp);
          break;
        case 'foundation':
          newFoundation[to.index].push(...faceUp);
          break;
      }

      const moveScore = calculateMoveScore(from.pile, to.pile, revealedCard);
      const next: GameState = {
        ...state,
        tableau: newTableau,
        foundation: newFoundation,
        waste: newWaste,
        score: Math.max(0, state.score + moveScore),
        moves: state.moves + 1,
        history: [...state.history, snap],
      };

      return checkWin(next) ? { ...next, gameStatus: 'won' } : next;
    }

    case 'UNDO': {
      if (state.history.length === 0 || state.undosRemaining <= 0) return state;
      const last = state.history[state.history.length - 1];
      return {
        ...state,
        tableau: last.tableau,
        foundation: last.foundation,
        stock: last.stock,
        waste: last.waste,
        score: Math.max(0, last.score + SCORING.UNDO),
        moves: last.moves,
        stockRecycles: last.stockRecycles,
        history: state.history.slice(0, -1),
        undosRemaining: state.undosRemaining - 1,
      };
    }

    case 'PAUSE':
      return state.gameStatus === 'playing' ? { ...state, gameStatus: 'paused' } : state;

    case 'RESUME':
      return state.gameStatus === 'paused' ? { ...state, gameStatus: 'playing' } : state;

    case 'SET_DRAW_MODE':
      return state.gameStatus === 'idle' ? { ...state, drawMode: action.mode } : state;

    case 'TICK':
      return state.gameStatus === 'playing'
        ? { ...state, timeElapsed: state.timeElapsed + 1 }
        : state;

    case 'AUTO_COMPLETE_STEP': {
      const move = findAutoFoundationMove(state);
      if (!move) return state;
      return reducer(state, { type: 'MOVE_CARDS', from: move.from, to: move.to });
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState());

  const newGame = useCallback(() => {
    dispatch({ type: 'DEAL' });
  }, []);

  return {
    state,
    dispatch,
    newGame,
    canAutoComplete: canAutoComplete(state),
  };
}
