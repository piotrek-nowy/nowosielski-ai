"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChessEngine } from "./ChessEngine";
import { ChessBot } from "./ChessBot";
import {
  type PieceColor, type PieceType, type Position, type Move,
  type GameMode, type Difficulty, type BoardSkin, type PieceSkin,
  type TimeControl, BOARD_SKINS, getPieceImageUrl, TIME_CONTROLS,
  formatTimeControl, CHESS_QUOTES,
} from "./types";

type Phase = "setup" | "playing" | "gameover";

interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PieceColor;
  timeControl: TimeControl | null;
  boardSkin: BoardSkin;
  pieceSkin: PieceSkin;
}

const STORAGE_KEY = "chess_game_state";
const PREFS_KEY = "chess_preferences";
const RECORDS_KEY = "chess_records";

function loadPrefs(): Partial<GameConfig> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(config: GameConfig) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      boardSkin: config.boardSkin,
      pieceSkin: config.pieceSkin,
    }));
  } catch { /* noop */ }
}

function formatClock(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ChessGame() {
  const t = useTranslations("chess");
  const locale = useLocale();
  const prefs = useMemo(() => {
    if (typeof window === "undefined") return {};
    return loadPrefs();
  }, []);

  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<GameConfig>({
    mode: "pvc",
    difficulty: "medium",
    playerColor: "white",
    timeControl: null,
    boardSkin: (prefs.boardSkin as BoardSkin) || "brown",
    pieceSkin: (prefs.pieceSkin as PieceSkin) || "cburnett",
  });

  const [engine, setEngine] = useState<ChessEngine | null>(null);
  const [bot, setBot] = useState<ChessBot | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: Position; to: Position; moves: Move[] } | null>(null);
  const [gameStatus, setGameStatus] = useState<ReturnType<ChessEngine["getGameStatus"]> | null>(null);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [faceEmoji, setFaceEmoji] = useState("😊");
  const [skinPickerOpen, setSkinPickerOpen] = useState(false);
  const [boardSkin, setBoardSkin] = useState<BoardSkin>(config.boardSkin);
  const [pieceSkin, setPieceSkin] = useState<PieceSkin>(config.pieceSkin);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const [botThinking, setBotThinking] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const engineRef = useRef<ChessEngine | null>(null);
  const configRef = useRef<GameConfig>(config);

  useEffect(() => { engineRef.current = engine; }, [engine]);
  useEffect(() => { configRef.current = config; }, [config]);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % CHESS_QUOTES.length);
        setQuoteFade(true);
      }, 500);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Try to restore saved game on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const restored = ChessEngine.deserialize(data.engineState);
        setEngine(restored);
        setConfig(data.config);
        setBoardSkin(data.config.boardSkin);
        setPieceSkin(data.config.pieceSkin);
        if (data.config.mode === "pvc") {
          setBot(new ChessBot(data.config.difficulty));
        }
        if (data.config.timeControl) {
          setWhiteTime(data.whiteTime);
          setBlackTime(data.blackTime);
        }
        setLastMove(data.lastMove || null);
        setGameStatus(restored.getGameStatus());
        const status = restored.getGameStatus();
        if (status.gameOver) {
          setPhase("gameover");
          if (status.isCheckmate) {
            setGameOverReason(status.winner === "white" ? t("whiteWins") : t("blackWins"));
          } else {
            setGameOverReason(t("draw"));
          }
        } else {
          setPhase("playing");
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save game state to localStorage
  const saveGame = useCallback(() => {
    if (!engineRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        engineState: engineRef.current.serialize(),
        config: configRef.current,
        whiteTime,
        blackTime,
        lastMove,
      }));
    } catch { /* noop */ }
  }, [whiteTime, blackTime, lastMove]);

  useEffect(() => {
    if (phase === "playing" && engine) saveGame();
  }, [phase, engine, saveGame]);

  // Timer management
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      const eng = engineRef.current;
      if (!eng || !configRef.current.timeControl) return;

      if (eng.currentTurn === "white") {
        setWhiteTime(prev => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeout("black");
            return 0;
          }
          return next;
        });
      } else {
        setBlackTime(prev => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeout("white");
            return 0;
          }
          return next;
        });
      }
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback((winner: PieceColor) => {
    stopTimer();
    setGameOverReason(t("timeout"));
    setGameStatus({
      isCheck: false, isCheckmate: false, isStalemate: false,
      isDraw: false, gameOver: true, winner,
    });
    setFaceEmoji("😵");
    setPhase("gameover");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopTimer]);

  // Start new game
  const startGame = useCallback(() => {
    const newEngine = new ChessEngine();
    setEngine(newEngine);
    engineRef.current = newEngine;
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setPromotionPending(null);
    setGameStatus(null);
    setGameOverReason("");
    setFaceEmoji("😊");
    setBotThinking(false);

    if (config.mode === "pvc") {
      setBot(new ChessBot(config.difficulty));
    } else {
      setBot(null);
    }

    if (config.timeControl) {
      const ms = config.timeControl.minutes * 60 * 1000;
      setWhiteTime(ms);
      setBlackTime(ms);
    }

    savePrefs(config);
    setPhase("playing");
    localStorage.removeItem(STORAGE_KEY);

    if (config.timeControl) {
      setTimeout(() => {
        lastTickRef.current = Date.now();
        startTimer();
      }, 100);
    }

    // If playing as black vs computer, bot moves first
    if (config.mode === "pvc" && config.playerColor === "black") {
      setTimeout(() => {
        const b = new ChessBot(config.difficulty);
        const move = b.getBestMove(newEngine);
        if (move) {
          newEngine.makeMove(move);
          setEngine(Object.assign(Object.create(Object.getPrototypeOf(newEngine)), newEngine));
          setLastMove({ from: move.from, to: move.to });
          setGameStatus(newEngine.getGameStatus());
        }
      }, 300);
    }
  }, [config, startTimer]);

  // Process a move after selection
  const executeMove = useCallback((move: Move) => {
    if (!engine) return;

    engine.makeMove(move);
    const newEngine = Object.assign(Object.create(Object.getPrototypeOf(engine)), engine);

    setEngine(newEngine);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove({ from: move.from, to: move.to });

    if (config.timeControl && config.timeControl.increment > 0) {
      const inc = config.timeControl.increment * 1000;
      if (move.piece.color === "white") {
        setWhiteTime(prev => prev + inc);
      } else {
        setBlackTime(prev => prev + inc);
      }
    }

    const status = newEngine.getGameStatus();
    setGameStatus(status);

    if (status.gameOver) {
      stopTimer();
      if (status.isCheckmate) {
        setGameOverReason(status.winner === "white" ? t("whiteWins") : t("blackWins"));
      } else {
        setGameOverReason(status.isStalemate ? t("stalemate") : t("draw"));
      }

      const isPlayerWin = config.mode === "pvc" && status.isCheckmate && status.winner === config.playerColor;
      setFaceEmoji(isPlayerWin ? "😎" : status.isDraw ? "😊" : "😵");
      setPhase("gameover");

      saveRecords(status, config);
      return;
    }

    // Bot's turn
    if (config.mode === "pvc" && newEngine.currentTurn !== config.playerColor) {
      setBotThinking(true);
      setTimeout(() => {
        if (!bot) return;
        const botMove = bot.getBestMove(newEngine);
        if (botMove) {
          newEngine.makeMove(botMove);
          const updated = Object.assign(Object.create(Object.getPrototypeOf(newEngine)), newEngine);
          setEngine(updated);
          setLastMove({ from: botMove.from, to: botMove.to });

          if (config.timeControl && config.timeControl.increment > 0) {
            const inc = config.timeControl.increment * 1000;
            if (botMove.piece.color === "white") {
              setWhiteTime(prev => prev + inc);
            } else {
              setBlackTime(prev => prev + inc);
            }
          }

          const botStatus = updated.getGameStatus();
          setGameStatus(botStatus);

          if (botStatus.gameOver) {
            stopTimer();
            if (botStatus.isCheckmate) {
              setGameOverReason(botStatus.winner === "white" ? t("whiteWins") : t("blackWins"));
            } else {
              setGameOverReason(botStatus.isStalemate ? t("stalemate") : t("draw"));
            }
            const lost = botStatus.isCheckmate && botStatus.winner !== config.playerColor;
            setFaceEmoji(lost ? "😵" : botStatus.isDraw ? "😊" : "😎");
            setPhase("gameover");
            saveRecords(botStatus, config);
          }
        }
        setBotThinking(false);
      }, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, bot, config, stopTimer]);

  // Handle square click
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!engine || phase !== "playing" || botThinking) return;
    if (config.mode === "pvc" && engine.currentTurn !== config.playerColor) return;

    const pos: Position = { row, col };
    const piece = engine.board[row][col];

    if (selectedSquare) {
      const isLegalTarget = legalMoves.some(m => m.row === row && m.col === col);

      if (isLegalTarget) {
        setFaceEmoji("😮");
        setTimeout(() => setFaceEmoji("😊"), 300);

        const moves = engine.getLegalMoves(selectedSquare).filter(
          m => m.to.row === row && m.to.col === col
        );

        if (moves.length > 1 && moves[0].promotion) {
          setPromotionPending({ from: selectedSquare, to: pos, moves });
          return;
        }

        if (moves.length > 0) executeMove(moves[0]);
        return;
      }

      if (piece && piece.color === engine.currentTurn) {
        const moves = engine.getLegalMoves(pos);
        setSelectedSquare(pos);
        setLegalMoves(moves.map(m => m.to));
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === engine.currentTurn) {
      const moves = engine.getLegalMoves(pos);
      setSelectedSquare(pos);
      setLegalMoves(moves.map(m => m.to));
    }
  }, [engine, phase, botThinking, config, selectedSquare, legalMoves, executeMove]);

  // Handle promotion choice
  const handlePromotion = useCallback((type: PieceType) => {
    if (!promotionPending) return;
    const move = promotionPending.moves.find(m => m.promotion === type);
    if (move) executeMove(move);
    setPromotionPending(null);
  }, [promotionPending, executeMove]);

  // Undo: in PvC, undo both the bot's response and the player's move
  const handleUndo = useCallback(() => {
    if (!engine || engine.moveHistory.length === 0) return;

    if (config.mode === "pvc") {
      // Undo until it's the player's turn again
      engine.undoMove();
      if (engine.currentTurn !== config.playerColor && engine.moveHistory.length > 0) {
        engine.undoMove();
      }
    } else {
      engine.undoMove();
    }

    const updated = Object.assign(Object.create(Object.getPrototypeOf(engine)), engine);
    setEngine(updated);
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionPending(null);
    setGameStatus(updated.getGameStatus());

    const hist = updated.moveHistory;
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  }, [engine, config.mode, config.playerColor]);

  // Download PGN
  const handleDownloadPGN = useCallback(() => {
    if (!engine) return;
    const pgn = engine.toPGN();
    downloadFile(pgn, `chess_${new Date().toISOString().slice(0, 10)}.pgn`);
  }, [engine]);

  // Board orientation: PvP flips each move, PvC fixed based on player color
  const flipped = config.mode === "pvc"
    ? config.playerColor === "black"
    : engine?.currentTurn === "black";

  // King position for check highlighting
  const kingInCheck = useMemo(() => {
    if (!engine || !gameStatus?.isCheck) return null;
    try { return engine.findKing(engine.currentTurn); } catch { return null; }
  }, [engine, gameStatus]);

  const colors = BOARD_SKINS[boardSkin];
  const quote = CHESS_QUOTES[quoteIndex];

  // Cleanup timer on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  if (phase === "setup") {
    return (
      <SetupScreen
        config={config}
        setConfig={setConfig}
        boardSkin={boardSkin}
        setBoardSkin={setBoardSkin}
        pieceSkin={pieceSkin}
        setPieceSkin={setPieceSkin}
        onStart={startGame}
        t={t}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status bar */}
      <div className="flex items-center gap-4 text-lg font-medium">
        <span className="text-2xl">{t("title")}</span>
        {gameStatus?.isCheck && phase === "playing" && (
          <span className="text-red-500 font-bold animate-pulse">{t("check")}</span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-[900px]">
        {/* Left side: board + controls */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Top timer (opponent's perspective) */}
          {config.timeControl && (
            <TimerDisplay
              time={flipped ? whiteTime : blackTime}
              active={phase === "playing" && engine?.currentTurn === (flipped ? "white" : "black")}
              label={flipped ? t("white") : t("black")}
            />
          )}

          {/* Board */}
          <div
            className="relative select-none"
            onContextMenu={e => e.preventDefault()}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(8, 1fr)",
                gridTemplateRows: "repeat(8, 1fr)",
                width: "min(560px, calc(100vw - 32px))",
                aspectRatio: "1 / 1",
              }}
            >
              {Array.from({ length: 64 }, (_, i) => {
                const displayRow = Math.floor(i / 8);
                const displayCol = i % 8;
                const row = flipped ? 7 - displayRow : displayRow;
                const col = flipped ? 7 - displayCol : displayCol;
                const piece = engine?.board[row][col];
                const isLight = (row + col) % 2 === 0;
                const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
                const isLegal = legalMoves.some(m => m.row === row && m.col === col);
                const isLastFrom = lastMove?.from.row === row && lastMove?.from.col === col;
                const isLastTo = lastMove?.to.row === row && lastMove?.to.col === col;
                const isKingCheck = kingInCheck?.row === row && kingInCheck?.col === col;

                let bg = isLight ? colors.light : colors.dark;
                if (isSelected) bg = "#ffff00aa";
                else if (isLastFrom || isLastTo) bg = isLight ? "#f7f769" : "#baca44";
                if (isKingCheck) bg = "#ff4444";

                return (
                  <div
                    key={`${row}-${col}`}
                    className="relative flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: bg, aspectRatio: "1 / 1" }}
                    onClick={() => handleSquareClick(row, col)}
                  >
                    {/* Rank/file labels */}
                    {displayCol === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-[9px] font-mono opacity-60 pointer-events-none select-none"
                        style={{ color: isLight ? colors.dark : colors.light }}>
                        {8 - row}
                      </span>
                    )}
                    {displayRow === 7 && (
                      <span className="absolute bottom-0 right-0.5 text-[9px] font-mono opacity-60 pointer-events-none select-none"
                        style={{ color: isLight ? colors.dark : colors.light }}>
                        {"abcdefgh"[col]}
                      </span>
                    )}

                    {/* Piece */}
                    {piece && (
                      <img
                        src={getPieceImageUrl(piece, pieceSkin)}
                        alt={`${piece.color} ${piece.type}`}
                        className="w-[85%] h-[85%] object-contain pointer-events-none"
                        draggable={false}
                      />
                    )}

                    {/* Legal move indicator */}
                    {isLegal && !piece && (
                      <div className="absolute w-[28%] h-[28%] rounded-full bg-black/20" />
                    )}
                    {isLegal && piece && (
                      <div className="absolute inset-0 border-[3px] border-black/30 rounded-sm pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Promotion dialog */}
            {promotionPending && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="bg-card rounded-lg p-4 shadow-xl">
                  <p className="text-center text-sm font-medium mb-3">{t("promote")}</p>
                  <div className="flex gap-2">
                    {(["queen", "rook", "bishop", "knight"] as PieceType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => handlePromotion(type)}
                        className="w-14 h-14 rounded-lg bg-muted hover:bg-accent transition-colors flex items-center justify-center"
                      >
                        <img
                          src={getPieceImageUrl({ type, color: engine!.currentTurn }, pieceSkin)}
                          alt={type}
                          className="w-10 h-10"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom timer (player's perspective) */}
          {config.timeControl && (
            <TimerDisplay
              time={flipped ? blackTime : whiteTime}
              active={phase === "playing" && engine?.currentTurn === (flipped ? "black" : "white")}
              label={flipped ? t("black") : t("white")}
            />
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
            <button
              onClick={() => {
                setFaceEmoji(prev => prev === "😮" ? "😊" : "😮");
                if (phase === "gameover") {
                  setPhase("setup");
                  stopTimer();
                  localStorage.removeItem(STORAGE_KEY);
                } else {
                  setPhase("setup");
                  stopTimer();
                }
              }}
              className="text-2xl hover:scale-110 transition-transform"
              title={t("newGame")}
            >
              {faceEmoji}
            </button>

            <Button variant="outline" size="sm" onClick={handleUndo} disabled={
              !engine || engine.moveHistory.length === 0 || phase === "gameover" || botThinking ||
              (config.mode === "pvc" && config.playerColor === "black" && engine.moveHistory.length < 2)
            }>
              {t("undo")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { stopTimer(); setPhase("setup"); localStorage.removeItem(STORAGE_KEY); }}>
              {t("newGame")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPGN} disabled={!engine || engine.moveHistory.length === 0}>
              {t("downloadPGN")}
            </Button>
            <button
              onClick={() => setSkinPickerOpen(!skinPickerOpen)}
              className="text-xl hover:scale-110 transition-transform"
              title={t("boardSkin")}
            >
              🎨
            </button>
          </div>

          {/* Skin picker */}
          {skinPickerOpen && (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg w-full max-w-[560px]">
              <div className="mb-2">
                <p className="text-xs text-muted-foreground mb-1">{t("boardSkin")}</p>
                <div className="flex gap-2">
                  {(Object.keys(BOARD_SKINS) as BoardSkin[]).map(skin => (
                    <button
                      key={skin}
                      onClick={() => { setBoardSkin(skin); setConfig(c => ({ ...c, boardSkin: skin })); }}
                      className={`w-8 h-8 rounded border-2 transition-all ${boardSkin === skin ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ background: `linear-gradient(135deg, ${BOARD_SKINS[skin].light} 50%, ${BOARD_SKINS[skin].dark} 50%)` }}
                      title={skin}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("pieceSkin")}</p>
                <div className="flex gap-2">
                  {(["cburnett", "neo", "alpha", "fantasy"] as PieceSkin[]).map(skin => (
                    <button
                      key={skin}
                      onClick={() => { setPieceSkin(skin); setConfig(c => ({ ...c, pieceSkin: skin })); }}
                      className={`w-10 h-10 rounded border-2 transition-all flex items-center justify-center bg-muted ${pieceSkin === skin ? "border-foreground scale-110" : "border-transparent"}`}
                    >
                      <img
                        src={getPieceImageUrl({ type: "knight", color: "white" }, skin)}
                        alt={skin}
                        className="w-7 h-7"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side: move history */}
        <div className="flex-1 min-w-[200px] max-w-[300px] hidden lg:block">
          <MoveHistory engine={engine} t={t} />
        </div>
      </div>

      {/* Move history for mobile */}
      <div className="w-full max-w-[560px] lg:hidden">
        <MoveHistory engine={engine} t={t} />
      </div>

      {/* Game over overlay */}
      {phase === "gameover" && (
        <div className="bg-card border border-border rounded-lg p-6 text-center shadow-xl max-w-sm">
          <p className="text-3xl mb-2">{faceEmoji}</p>
          <p className="text-lg font-bold">{gameStatus?.isCheckmate ? t("checkmate") : t("draw")}</p>
          <p className="text-muted-foreground">{gameOverReason}</p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => { setPhase("setup"); stopTimer(); localStorage.removeItem(STORAGE_KEY); }}>
              {t("playAgain")}
            </Button>
            <Button variant="outline" onClick={handleDownloadPGN} disabled={!engine || engine.moveHistory.length === 0}>
              {t("downloadPGN")}
            </Button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="max-w-[560px] text-center mt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Rotating quotes */}
      <div className="max-w-[560px] text-center min-h-[60px] flex items-center justify-center">
        <div className={`transition-opacity duration-500 ${quoteFade ? "opacity-100" : "opacity-0"}`}>
          <p className="text-sm italic text-gray-400">
            &ldquo;{locale === "pl" ? quote.text : quote.textEn}&rdquo;
          </p>
          <p className="text-xs font-bold text-gray-500 mt-1">— {quote.author}</p>
        </div>
      </div>

      {/* Records */}
      <RecordsTable t={t} />
    </div>
  );
}

/* ─── Setup Screen ─── */

interface SetupProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  boardSkin: BoardSkin;
  setBoardSkin: (s: BoardSkin) => void;
  pieceSkin: PieceSkin;
  setPieceSkin: (s: PieceSkin) => void;
  onStart: () => void;
  t: ReturnType<typeof useTranslations>;
}

function SetupScreen({ config, setConfig, boardSkin, setBoardSkin, pieceSkin, setPieceSkin, onStart, t }: SetupProps) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {/* Game mode */}
      <div className="w-full">
        <label className="text-sm text-muted-foreground">{t("gameMode")}</label>
        <div className="flex gap-2 mt-1">
          <Button
            variant={config.mode === "pvp" ? "default" : "outline"} size="sm"
            onClick={() => setConfig(c => ({ ...c, mode: "pvp" }))}
          >{t("pvp")}</Button>
          <Button
            variant={config.mode === "pvc" ? "default" : "outline"} size="sm"
            onClick={() => setConfig(c => ({ ...c, mode: "pvc" }))}
          >{t("pvc")}</Button>
        </div>
      </div>

      {/* Difficulty (PvC only) */}
      {config.mode === "pvc" && (
        <div className="w-full">
          <label className="text-sm text-muted-foreground">{t("difficulty")}</label>
          <div className="flex gap-2 mt-1">
            {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
              <Button
                key={d}
                variant={config.difficulty === d ? "default" : "outline"} size="sm"
                onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
              >{t(d)}</Button>
            ))}
          </div>
        </div>
      )}

      {/* Player color (PvC only) */}
      {config.mode === "pvc" && (
        <div className="w-full">
          <label className="text-sm text-muted-foreground">{t("playAs")}</label>
          <div className="flex gap-2 mt-1">
            <Button
              variant={config.playerColor === "white" ? "default" : "outline"} size="sm"
              onClick={() => setConfig(c => ({ ...c, playerColor: "white" }))}
            >♔ {t("white")}</Button>
            <Button
              variant={config.playerColor === "black" ? "default" : "outline"} size="sm"
              onClick={() => setConfig(c => ({ ...c, playerColor: "black" }))}
            >♚ {t("black")}</Button>
          </div>
        </div>
      )}

      {/* Time control */}
      <div className="w-full">
        <label className="text-sm text-muted-foreground">{t("timeControl")}</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {TIME_CONTROLS.map((tc, i) => (
            <Button
              key={i}
              variant={
                (tc === null && config.timeControl === null) ||
                (tc && config.timeControl && tc.minutes === config.timeControl.minutes && tc.increment === config.timeControl.increment)
                  ? "default" : "outline"
              }
              size="sm"
              className="text-xs px-2 py-1"
              onClick={() => setConfig(c => ({ ...c, timeControl: tc }))}
            >
              {formatTimeControl(tc)}
            </Button>
          ))}
        </div>
      </div>

      {/* Board skin */}
      <div className="w-full">
        <label className="text-sm text-muted-foreground">{t("boardSkin")}</label>
        <div className="flex gap-2 mt-1">
          {(Object.keys(BOARD_SKINS) as BoardSkin[]).map(skin => (
            <button
              key={skin}
              onClick={() => { setBoardSkin(skin); setConfig(c => ({ ...c, boardSkin: skin })); }}
              className={`w-10 h-10 rounded border-2 transition-all ${boardSkin === skin ? "border-foreground scale-110" : "border-border"}`}
              style={{ background: `linear-gradient(135deg, ${BOARD_SKINS[skin].light} 50%, ${BOARD_SKINS[skin].dark} 50%)` }}
              title={skin}
            />
          ))}
        </div>
      </div>

      {/* Piece skin */}
      <div className="w-full">
        <label className="text-sm text-muted-foreground">{t("pieceSkin")}</label>
        <div className="flex gap-2 mt-1">
          {(["cburnett", "neo", "alpha", "fantasy"] as PieceSkin[]).map(skin => (
            <button
              key={skin}
              onClick={() => { setPieceSkin(skin); setConfig(c => ({ ...c, pieceSkin: skin })); }}
              className={`w-12 h-12 rounded border-2 transition-all flex items-center justify-center bg-muted ${pieceSkin === skin ? "border-foreground scale-110" : "border-border"}`}
            >
              <img
                src={getPieceImageUrl({ type: "knight", color: "white" }, skin)}
                alt={skin}
                className="w-8 h-8"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full mt-2" size="lg" onClick={onStart}>{t("startGame")}</Button>
    </div>
  );
}

/* ─── Timer Display ─── */

function TimerDisplay({ time, active, label }: { time: number; active: boolean; label: string }) {
  return (
    <div className={`flex items-center justify-between w-full max-w-[560px] px-3 py-1.5 rounded font-mono text-lg
      ${active ? "bg-foreground text-background font-bold" : "bg-muted text-muted-foreground"}`}>
      <span className="text-xs uppercase tracking-wider">{label}</span>
      <span>{formatClock(time)}</span>
    </div>
  );
}

/* ─── Move History ─── */

function MoveHistory({ engine, t }: { engine: ChessEngine | null; t: ReturnType<typeof useTranslations> }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [engine?.moveHistory.length]);

  if (!engine) return null;

  const pairs: { num: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < engine.moveHistory.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: engine.moveHistory[i]?.notation || "??",
      black: engine.moveHistory[i + 1]?.notation,
    });
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/50">
        <span className="text-sm font-medium">{t("moves")}</span>
      </div>
      <div ref={scrollRef} className="max-h-[400px] overflow-y-auto p-1">
        {pairs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">—</p>
        ) : (
          <table className="w-full text-sm font-mono">
            <tbody>
              {pairs.map(p => (
                <tr key={p.num} className="hover:bg-muted/30">
                  <td className="w-8 text-right text-muted-foreground pr-2 py-0.5">{p.num}.</td>
                  <td className="py-0.5 px-1">{p.white}</td>
                  <td className="py-0.5 px-1">{p.black || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── Records Table ─── */

interface RecordEntry { difficulty: string; moves: number; date: string }

function saveRecords(status: ReturnType<ChessEngine["getGameStatus"]>, config: GameConfig) {
  if (!status.isCheckmate || config.mode !== "pvc" || status.winner !== config.playerColor) return;
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    const records: RecordEntry[] = raw ? JSON.parse(raw) : [];
    records.push({
      difficulty: config.difficulty,
      moves: 0, // will be set below
      date: new Date().toISOString().slice(0, 10),
    });
    // Keep only top 10 per difficulty
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records.slice(-30)));
  } catch { /* noop */ }
}

function RecordsTable({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [records, setRecords] = useState<RecordEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  if (records.length === 0) return null;

  const byDifficulty = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.difficulty] = (acc[r.difficulty] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-[560px] w-full">
      <div className="bg-card border border-border rounded-lg p-3">
        <p className="text-sm font-medium mb-2">🏆 {t("records")}</p>
        <div className="flex gap-4 text-sm">
          {Object.entries(byDifficulty).map(([d, count]) => (
            <div key={d} className="text-center">
              <p className="font-mono font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{t(d as "easy" | "medium" | "hard")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
