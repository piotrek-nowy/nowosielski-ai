import { ChessEngine } from './ChessEngine';
import { Move, PieceColor, PieceType, Difficulty } from './types';

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
};

/* Piece-square tables from white's perspective. Row 0 = rank 8. */

const PST_PAWN = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10, 10,  5, 10, 10,  5, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const PST_ROOK = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0],
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const PST_KING = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20],
];

const PST: Record<PieceType, number[][]> = {
  pawn: PST_PAWN, knight: PST_KNIGHT, bishop: PST_BISHOP,
  rook: PST_ROOK, queen: PST_QUEEN, king: PST_KING,
};

function getPST(type: PieceType, color: PieceColor, row: number, col: number): number {
  const r = color === 'white' ? row : 7 - row;
  return PST[type][r][col];
}

function evaluateFull(engine: ChessEngine): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = engine.board[row][col];
      if (!p) continue;
      const val = PIECE_VALUES[p.type] + getPST(p.type, p.color, row, col);
      score += p.color === 'white' ? val : -val;
    }
  }
  return score;
}

function evaluateMaterial(engine: ChessEngine): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = engine.board[row][col];
      if (!p) continue;
      score += p.color === 'white' ? PIECE_VALUES[p.type] : -PIECE_VALUES[p.type];
    }
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    let sa = 0, sb = 0;
    if (a.captured) sa += PIECE_VALUES[a.captured.type] - PIECE_VALUES[a.piece.type] / 10;
    if (b.captured) sb += PIECE_VALUES[b.captured.type] - PIECE_VALUES[b.piece.type] / 10;
    if (a.promotion) sa += PIECE_VALUES[a.promotion];
    if (b.promotion) sb += PIECE_VALUES[b.promotion];
    return sb - sa;
  });
}

export class ChessBot {
  difficulty: Difficulty;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  getBestMove(engine: ChessEngine): Move | null {
    const moves = engine.getAllLegalMoves();
    if (moves.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return moves[Math.floor(Math.random() * moves.length)];
      case 'medium':
        return this.search(engine, 2, false);
      case 'hard':
        return this.search(engine, 4, true);
    }
  }

  private search(engine: ChessEngine, depth: number, useAlphaBeta: boolean): Move | null {
    const moves = orderMoves(engine.getAllLegalMoves());
    if (moves.length === 0) return null;

    const maximizing = engine.currentTurn === 'white';
    let bestMove: Move | null = null;
    let bestScore = maximizing ? -Infinity : Infinity;

    for (const move of moves) {
      engine.makeMove(move);
      const score = useAlphaBeta
        ? this.alphaBeta(engine, depth - 1, -Infinity, Infinity, !maximizing)
        : this.minimax(engine, depth - 1, !maximizing);
      engine.undoMove();

      if (maximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  private minimax(engine: ChessEngine, depth: number, maximizing: boolean): number {
    if (depth === 0) return evaluateMaterial(engine);

    const status = engine.getGameStatus();
    if (status.gameOver) {
      if (status.isCheckmate) return status.winner === 'white' ? 100000 : -100000;
      return 0;
    }

    const moves = engine.getAllLegalMoves();
    let best = maximizing ? -Infinity : Infinity;

    for (const move of moves) {
      engine.makeMove(move);
      const score = this.minimax(engine, depth - 1, !maximizing);
      engine.undoMove();
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  private alphaBeta(engine: ChessEngine, depth: number, alpha: number, beta: number, maximizing: boolean): number {
    if (depth === 0) return evaluateFull(engine);

    const status = engine.getGameStatus();
    if (status.gameOver) {
      if (status.isCheckmate) {
        const mateBonus = depth;
        return status.winner === 'white' ? 100000 + mateBonus : -100000 - mateBonus;
      }
      return 0;
    }

    const moves = orderMoves(engine.getAllLegalMoves());

    if (maximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        engine.makeMove(move);
        const val = this.alphaBeta(engine, depth - 1, alpha, beta, false);
        engine.undoMove();
        maxEval = Math.max(maxEval, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        engine.makeMove(move);
        const val = this.alphaBeta(engine, depth - 1, alpha, beta, true);
        engine.undoMove();
        minEval = Math.min(minEval, val);
        beta = Math.min(beta, val);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}
