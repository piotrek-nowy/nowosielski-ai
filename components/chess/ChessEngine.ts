import { Board, Piece, PieceColor, PieceType, Position, Move, CastlingRights } from './types';

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function opponent(color: PieceColor): PieceColor {
  return color === 'white' ? 'black' : 'white';
}

const FILE_LETTERS = 'abcdefgh';

const PIECE_NOTATION: Record<PieceType, string> = {
  king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: '',
};

const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const STRAIGHT_DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const DIAG_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const ALL_DIRS = [...STRAIGHT_DIRS, ...DIAG_DIRS];

export class ChessEngine {
  board: Board;
  currentTurn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  moveHistory: Move[];
  halfMoveClock: number;
  fullMoveNumber: number;

  constructor() {
    this.board = this.createInitialBoard();
    this.currentTurn = 'white';
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true },
    };
    this.enPassantTarget = null;
    this.moveHistory = [];
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
  }

  private createInitialBoard(): Board {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
    const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: backRank[col], color: 'black' };
      board[1][col] = { type: 'pawn', color: 'black' };
      board[6][col] = { type: 'pawn', color: 'white' };
      board[7][col] = { type: backRank[col], color: 'white' };
    }
    return board;
  }

  clone(): ChessEngine {
    const e = new ChessEngine();
    e.board = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
    e.currentTurn = this.currentTurn;
    e.castlingRights = {
      white: { ...this.castlingRights.white },
      black: { ...this.castlingRights.black },
    };
    e.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    e.moveHistory = this.moveHistory.map(m => ({ ...m }));
    e.halfMoveClock = this.halfMoveClock;
    e.fullMoveNumber = this.fullMoveNumber;
    return e;
  }

  findKing(color: PieceColor): Position {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.board[row][col];
        if (p && p.type === 'king' && p.color === color) return { row, col };
      }
    }
    throw new Error(`King not found for ${color}`);
  }

  isSquareAttacked(pos: Position, byColor: PieceColor): boolean {
    for (const [dr, dc] of KNIGHT_OFFSETS) {
      const r = pos.row + dr, c = pos.col + dc;
      if (inBounds(r, c)) {
        const p = this.board[r][c];
        if (p && p.color === byColor && p.type === 'knight') return true;
      }
    }

    const pawnDir = byColor === 'white' ? 1 : -1;
    for (const dc of [-1, 1]) {
      const r = pos.row + pawnDir, c = pos.col + dc;
      if (inBounds(r, c)) {
        const p = this.board[r][c];
        if (p && p.color === byColor && p.type === 'pawn') return true;
      }
    }

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = pos.row + dr, c = pos.col + dc;
        if (inBounds(r, c)) {
          const p = this.board[r][c];
          if (p && p.color === byColor && p.type === 'king') return true;
        }
      }
    }

    for (const [dr, dc] of STRAIGHT_DIRS) {
      for (let i = 1; i < 8; i++) {
        const r = pos.row + dr * i, c = pos.col + dc * i;
        if (!inBounds(r, c)) break;
        const p = this.board[r][c];
        if (p) {
          if (p.color === byColor && (p.type === 'rook' || p.type === 'queen')) return true;
          break;
        }
      }
    }

    for (const [dr, dc] of DIAG_DIRS) {
      for (let i = 1; i < 8; i++) {
        const r = pos.row + dr * i, c = pos.col + dc * i;
        if (!inBounds(r, c)) break;
        const p = this.board[r][c];
        if (p) {
          if (p.color === byColor && (p.type === 'bishop' || p.type === 'queen')) return true;
          break;
        }
      }
    }

    return false;
  }

  isInCheck(color: PieceColor): boolean {
    return this.isSquareAttacked(this.findKing(color), opponent(color));
  }

  private getPseudoLegalMoves(pos: Position): Move[] {
    const piece = this.board[pos.row][pos.col];
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn': return this.getPawnMoves(pos, piece);
      case 'knight': return this.getKnightMoves(pos, piece);
      case 'bishop': return this.getSlidingMoves(pos, piece, DIAG_DIRS);
      case 'rook': return this.getSlidingMoves(pos, piece, STRAIGHT_DIRS);
      case 'queen': return this.getSlidingMoves(pos, piece, ALL_DIRS);
      case 'king': return this.getKingMoves(pos, piece);
    }
  }

  private getPawnMoves(pos: Position, piece: Piece): Move[] {
    const moves: Move[] = [];
    const dir = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    const promoRow = piece.color === 'white' ? 0 : 7;

    const r1 = pos.row + dir;
    if (inBounds(r1, pos.col) && !this.board[r1][pos.col]) {
      if (r1 === promoRow) {
        for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
          moves.push({ from: pos, to: { row: r1, col: pos.col }, piece, promotion: promo });
        }
      } else {
        moves.push({ from: pos, to: { row: r1, col: pos.col }, piece });

        if (pos.row === startRow) {
          const r2 = pos.row + dir * 2;
          if (!this.board[r2][pos.col]) {
            moves.push({ from: pos, to: { row: r2, col: pos.col }, piece });
          }
        }
      }
    }

    for (const dc of [-1, 1]) {
      const cr = pos.row + dir, cc = pos.col + dc;
      if (!inBounds(cr, cc)) continue;

      const target = this.board[cr][cc];
      if (target && target.color !== piece.color) {
        if (cr === promoRow) {
          for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
            moves.push({ from: pos, to: { row: cr, col: cc }, piece, captured: target, promotion: promo });
          }
        } else {
          moves.push({ from: pos, to: { row: cr, col: cc }, piece, captured: target });
        }
      }

      if (this.enPassantTarget && this.enPassantTarget.row === cr && this.enPassantTarget.col === cc) {
        const capturedPawn = this.board[pos.row][cc];
        moves.push({
          from: pos,
          to: { row: cr, col: cc },
          piece,
          captured: capturedPawn || undefined,
          isEnPassant: true,
        });
      }
    }
    return moves;
  }

  private getKnightMoves(pos: Position, piece: Piece): Move[] {
    const moves: Move[] = [];
    for (const [dr, dc] of KNIGHT_OFFSETS) {
      const r = pos.row + dr, c = pos.col + dc;
      if (!inBounds(r, c)) continue;
      const target = this.board[r][c];
      if (!target || target.color !== piece.color) {
        moves.push({ from: pos, to: { row: r, col: c }, piece, captured: target || undefined });
      }
    }
    return moves;
  }

  private getSlidingMoves(pos: Position, piece: Piece, directions: number[][]): Move[] {
    const moves: Move[] = [];
    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const r = pos.row + dr * i, c = pos.col + dc * i;
        if (!inBounds(r, c)) break;
        const target = this.board[r][c];
        if (!target) {
          moves.push({ from: pos, to: { row: r, col: c }, piece });
        } else {
          if (target.color !== piece.color) {
            moves.push({ from: pos, to: { row: r, col: c }, piece, captured: target });
          }
          break;
        }
      }
    }
    return moves;
  }

  private getKingMoves(pos: Position, piece: Piece): Move[] {
    const moves: Move[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = pos.row + dr, c = pos.col + dc;
        if (!inBounds(r, c)) continue;
        const target = this.board[r][c];
        if (!target || target.color !== piece.color) {
          moves.push({ from: pos, to: { row: r, col: c }, piece, captured: target || undefined });
        }
      }
    }

    const opp = opponent(piece.color);
    const rights = this.castlingRights[piece.color];

    if (!this.isSquareAttacked(pos, opp)) {
      if (rights.kingside &&
          !this.board[pos.row][5] && !this.board[pos.row][6] &&
          !this.isSquareAttacked({ row: pos.row, col: 5 }, opp) &&
          !this.isSquareAttacked({ row: pos.row, col: 6 }, opp)) {
        moves.push({ from: pos, to: { row: pos.row, col: 6 }, piece, isCastling: 'kingside' });
      }
      if (rights.queenside &&
          !this.board[pos.row][1] && !this.board[pos.row][2] && !this.board[pos.row][3] &&
          !this.isSquareAttacked({ row: pos.row, col: 2 }, opp) &&
          !this.isSquareAttacked({ row: pos.row, col: 3 }, opp)) {
        moves.push({ from: pos, to: { row: pos.row, col: 2 }, piece, isCastling: 'queenside' });
      }
    }
    return moves;
  }

  getLegalMoves(pos: Position): Move[] {
    const piece = this.board[pos.row][pos.col];
    if (!piece || piece.color !== this.currentTurn) return [];

    return this.getPseudoLegalMoves(pos).filter(move => {
      this.applyMove(move);
      const inCheck = this.isInCheck(piece.color);
      this.revertMove(move);
      return !inCheck;
    });
  }

  getAllLegalMoves(color?: PieceColor): Move[] {
    const c = color || this.currentTurn;
    const moves: Move[] = [];
    const savedTurn = this.currentTurn;
    this.currentTurn = c;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === c) {
          moves.push(...this.getLegalMoves({ row, col }));
        }
      }
    }

    this.currentTurn = savedTurn;
    return moves;
  }

  private applyMove(move: Move): void {
    if (move.isEnPassant) {
      this.board[move.from.row][move.to.col] = null;
    }
    if (move.isCastling) {
      if (move.isCastling === 'kingside') {
        this.board[move.from.row][5] = this.board[move.from.row][7];
        this.board[move.from.row][7] = null;
      } else {
        this.board[move.from.row][3] = this.board[move.from.row][0];
        this.board[move.from.row][0] = null;
      }
    }
    this.board[move.to.row][move.to.col] = move.promotion
      ? { type: move.promotion, color: move.piece.color }
      : move.piece;
    this.board[move.from.row][move.from.col] = null;
  }

  private revertMove(move: Move): void {
    this.board[move.from.row][move.from.col] = move.piece;

    if (move.isEnPassant) {
      this.board[move.to.row][move.to.col] = null;
      this.board[move.from.row][move.to.col] = move.captured || null;
    } else {
      this.board[move.to.row][move.to.col] = move.captured || null;
    }

    if (move.isCastling) {
      if (move.isCastling === 'kingside') {
        this.board[move.from.row][7] = this.board[move.from.row][5];
        this.board[move.from.row][5] = null;
      } else {
        this.board[move.from.row][0] = this.board[move.from.row][3];
        this.board[move.from.row][3] = null;
      }
    }
  }

  makeMove(move: Move): void {
    move.prevCastlingRights = {
      white: { ...this.castlingRights.white },
      black: { ...this.castlingRights.black },
    };
    move.prevEnPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    move.prevHalfMoveClock = this.halfMoveClock;

    move.notation = this.computeNotation(move);
    this.applyMove(move);

    if (move.piece.type === 'king') {
      this.castlingRights[move.piece.color].kingside = false;
      this.castlingRights[move.piece.color].queenside = false;
    }
    if (move.piece.type === 'rook') {
      if (move.from.col === 0) this.castlingRights[move.piece.color].queenside = false;
      if (move.from.col === 7) this.castlingRights[move.piece.color].kingside = false;
    }
    if (move.captured?.type === 'rook') {
      const cc = move.captured.color;
      const backRow = cc === 'white' ? 7 : 0;
      if (move.to.row === backRow) {
        if (move.to.col === 0) this.castlingRights[cc].queenside = false;
        if (move.to.col === 7) this.castlingRights[cc].kingside = false;
      }
    }

    if (move.piece.type === 'pawn' && Math.abs(move.to.row - move.from.row) === 2) {
      this.enPassantTarget = { row: (move.from.row + move.to.row) / 2, col: move.from.col };
    } else {
      this.enPassantTarget = null;
    }

    this.halfMoveClock = (move.piece.type === 'pawn' || move.captured) ? 0 : this.halfMoveClock + 1;

    if (this.currentTurn === 'black') this.fullMoveNumber++;

    const oppColor = opponent(move.piece.color);
    const oppInCheck = this.isInCheck(oppColor);

    if (oppInCheck) {
      const savedTurn = this.currentTurn;
      this.currentTurn = oppColor;
      const oppHasMoves = this.getAllLegalMoves(oppColor).length > 0;
      this.currentTurn = savedTurn;

      if (!oppHasMoves) {
        move.isCheckmate = true;
        move.notation = move.notation!.replace(/[+#]$/, '') + '#';
      } else {
        move.isCheck = true;
        if (move.notation && !move.notation.endsWith('+')) move.notation += '+';
      }
    }

    this.currentTurn = oppColor;
    this.moveHistory.push(move);
  }

  undoMove(): Move | null {
    const move = this.moveHistory.pop();
    if (!move) return null;

    this.revertMove(move);

    if (move.prevCastlingRights) this.castlingRights = move.prevCastlingRights;
    this.enPassantTarget = move.prevEnPassantTarget ?? null;
    if (move.prevHalfMoveClock !== undefined) this.halfMoveClock = move.prevHalfMoveClock;

    this.currentTurn = move.piece.color;
    if (this.currentTurn === 'black') this.fullMoveNumber--;

    return move;
  }

  private computeNotation(move: Move): string {
    if (move.isCastling === 'kingside') return 'O-O';
    if (move.isCastling === 'queenside') return 'O-O-O';

    let notation = '';

    if (move.piece.type !== 'pawn') {
      notation += PIECE_NOTATION[move.piece.type];

      const ambiguous: Position[] = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (row === move.from.row && col === move.from.col) continue;
          const p = this.board[row][col];
          if (p && p.type === move.piece.type && p.color === move.piece.color) {
            const moves = this.getPseudoLegalMoves({ row, col });
            if (moves.some(m => m.to.row === move.to.row && m.to.col === move.to.col)) {
              ambiguous.push({ row, col });
            }
          }
        }
      }

      if (ambiguous.length > 0) {
        const sameFile = ambiguous.some(p => p.col === move.from.col);
        const sameRank = ambiguous.some(p => p.row === move.from.row);
        if (!sameFile) {
          notation += FILE_LETTERS[move.from.col];
        } else if (!sameRank) {
          notation += String(8 - move.from.row);
        } else {
          notation += FILE_LETTERS[move.from.col] + String(8 - move.from.row);
        }
      }
    }

    if (move.captured || move.isEnPassant) {
      if (move.piece.type === 'pawn') notation += FILE_LETTERS[move.from.col];
      notation += 'x';
    }

    notation += FILE_LETTERS[move.to.col] + String(8 - move.to.row);

    if (move.promotion) notation += '=' + PIECE_NOTATION[move.promotion];

    return notation;
  }

  getGameStatus(): {
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    gameOver: boolean;
    winner: PieceColor | null;
  } {
    const inCheck = this.isInCheck(this.currentTurn);
    const hasLegalMoves = this.getAllLegalMoves(this.currentTurn).length > 0;
    const isCheckmate = inCheck && !hasLegalMoves;
    const isStalemate = !inCheck && !hasLegalMoves;
    const insufficient = this.isInsufficientMaterial();
    const fiftyMove = this.halfMoveClock >= 100;
    const isDraw = isStalemate || insufficient || fiftyMove;
    const gameOver = isCheckmate || isDraw;
    const winner = isCheckmate ? opponent(this.currentTurn) : null;

    return { isCheck: inCheck, isCheckmate, isStalemate, isDraw, gameOver, winner };
  }

  private isInsufficientMaterial(): boolean {
    const pieces: { piece: Piece; row: number; col: number }[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col]) pieces.push({ piece: this.board[row][col]!, row, col });
      }
    }
    if (pieces.length === 2) return true;
    if (pieces.length === 3) {
      return pieces.some(p => p.piece.type === 'bishop' || p.piece.type === 'knight');
    }
    if (pieces.length === 4) {
      const bishops = pieces.filter(p => p.piece.type === 'bishop');
      if (bishops.length === 2 && bishops[0].piece.color !== bishops[1].piece.color) {
        const sameColorSquare = ((bishops[0].row + bishops[0].col) % 2) === ((bishops[1].row + bishops[1].col) % 2);
        if (sameColorSquare) return true;
      }
    }
    return false;
  }

  toPGN(metadata?: Record<string, string>): string {
    const headers: Record<string, string> = {
      Event: 'Casual Game',
      Site: 'nowosielski.ai',
      Date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      White: 'White',
      Black: 'Black',
      ...metadata,
    };

    const status = this.getGameStatus();
    let result = '*';
    if (status.isCheckmate) result = status.winner === 'white' ? '1-0' : '0-1';
    else if (status.isDraw) result = '1/2-1/2';
    headers.Result = result;

    let pgn = Object.entries(headers).map(([k, v]) => `[${k} "${v}"]`).join('\n') + '\n\n';

    let line = '';
    for (let i = 0; i < this.moveHistory.length; i++) {
      if (i % 2 === 0) line += `${Math.floor(i / 2) + 1}. `;
      line += (this.moveHistory[i].notation || '??') + ' ';
    }
    pgn += (line + result).trim();
    return pgn;
  }

  serialize(): string {
    return JSON.stringify({
      board: this.board,
      currentTurn: this.currentTurn,
      castlingRights: this.castlingRights,
      enPassantTarget: this.enPassantTarget,
      moveHistory: this.moveHistory,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
    });
  }

  static deserialize(json: string): ChessEngine {
    const data = JSON.parse(json);
    const e = new ChessEngine();
    e.board = data.board;
    e.currentTurn = data.currentTurn;
    e.castlingRights = data.castlingRights;
    e.enPassantTarget = data.enPassantTarget;
    e.moveHistory = data.moveHistory || [];
    e.halfMoveClock = data.halfMoveClock;
    e.fullMoveNumber = data.fullMoveNumber;
    return e;
  }
}
