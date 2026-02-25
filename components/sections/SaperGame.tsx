"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const CELL_SIZE_DESKTOP = 32;
const CELL_SIZE_MOBILE = 24;

const NUMBER_COLORS: Record<number, string> = {
  1: "#0000FF",
  2: "#008000",
  3: "#FF0000",
  4: "#000080",
  5: "#800000",
  6: "#008080",
  7: "#000000",
  8: "#808080",
};

type GameModeId = "beginner" | "intermediate" | "expert" | "custom";

type GameMode = {
  id: GameModeId;
  rows: number;
  cols: number;
  mines: number;
};

const PRESET_MODES: GameMode[] = [
  { id: "beginner", rows: 8, cols: 8, mines: 10 },
  { id: "intermediate", rows: 16, cols: 16, mines: 40 },
  { id: "expert", rows: 16, cols: 30, mines: 99 },
];

const MIN_ROWS = 8;
const MAX_ROWS = 24;
const MIN_COLS = 8;
const MAX_COLS = 30;
const MIN_MINES = 10;

function maxMines(rows: number, cols: number) {
  return Math.floor((rows * cols) / 3);
}

const STORAGE_PREFIX = "saper-best-";

function getStoredBestTime(key: string): number | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem(STORAGE_PREFIX + key);
  return s ? parseInt(s, 10) : null;
}

function persistBestTime(key: string, seconds: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_PREFIX + key, String(seconds));
}

function getModeKey(mode: GameMode): string {
  if (mode.id === "custom")
    return `custom-${mode.rows}-${mode.cols}-${mode.mines}`;
  return mode.id;
}

type CellMark = "none" | "flag" | "question";
type CellState = "hidden" | "revealed" | "mine" | "wrong-flag";

type Cell = {
  isMine: boolean;
  neighborMines: number;
  state: CellState;
  mark: CellMark;
};

type RevealStatus = "ok" | "lost" | "won";

function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      neighborMines: 0,
      state: "hidden" as CellState,
      mark: "none" as CellMark,
    }))
  );
}

function deepCopyBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  count: number,
  excludeRow: number,
  excludeCol: number
) {
  const excluded = new Set<string>([`${excludeRow},${excludeCol}`]);
  let placed = 0;
  while (placed < count) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const key = `${r},${c}`;
    if (excluded.has(key) || board[r][c].isMine) continue;
    board[r][c].isMine = true;
    placed++;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) n++;
        }
      }
      board[r][c].neighborMines = n;
    }
  }
}

function floodReveal(board: Cell[][], startR: number, startC: number) {
  const R = board.length;
  const C = board[0].length;
  const stack: [number, number][] = [[startR, startC]];
  while (stack.length > 0) {
    const [rr, cc] = stack.pop()!;
    if (rr < 0 || rr >= R || cc < 0 || cc >= C) continue;
    const cell = board[rr][cc];
    if (cell.state !== "hidden" || cell.mark === "flag") continue;
    cell.state = "revealed";
    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          stack.push([rr + dr, cc + dc]);
    }
  }
}

function computeReveal(
  prev: Cell[][],
  cells: [number, number][],
  isFirstClick: boolean,
  firstClickCell: [number, number] | null,
  mineCount: number
): { board: Cell[][]; status: RevealStatus } {
  const next = deepCopyBoard(prev);
  const R = next.length;
  const C = next[0].length;

  if (isFirstClick && firstClickCell) {
    const [r, c] = firstClickCell;
    placeMines(next, R, C, mineCount, r, c);
    const cell = next[r][c];
    if (cell.neighborMines === 0) floodReveal(next, r, c);
    else cell.state = "revealed";
  } else {
    for (const [r, c] of cells) {
      const cell = next[r]?.[c];
      if (!cell || cell.state !== "hidden" || cell.mark === "flag") continue;
      if (cell.isMine) {
        cell.state = "mine";
        for (let rr = 0; rr < R; rr++)
          for (let cc = 0; cc < C; cc++) {
            const x = next[rr][cc];
            if (x.isMine && x.state === "hidden") x.state = "mine";
            if (x.mark === "flag" && !x.isMine) x.state = "wrong-flag";
          }
        return { board: next, status: "lost" };
      }
      if (cell.neighborMines === 0) floodReveal(next, r, c);
      else cell.state = "revealed";
    }
  }

  let revealedCount = 0;
  for (let rr = 0; rr < R; rr++)
    for (let cc = 0; cc < C; cc++)
      if (next[rr][cc].state === "revealed") revealedCount++;
  if (revealedCount === R * C - mineCount) {
    return { board: next, status: "won" };
  }
  return { board: next, status: "ok" };
}

function formatTime(seconds: number): string {
  if (seconds >= 3600) return "999+";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : String(s);
}

export function SaperGame() {
  const t = useTranslations("saper");
  const [mode, setMode] = useState<GameMode>(PRESET_MODES[0]);
  const [customRows, setCustomRows] = useState(10);
  const [customCols, setCustomCols] = useState(10);
  const [customMines, setCustomMines] = useState(15);
  const [phase, setPhase] = useState<"select" | "playing" | "won" | "lost">("select");
  const [board, setBoard] = useState<Cell[][]>([]);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [face, setFace] = useState<"normal" | "click" | "won" | "lost">("normal");
  const [seconds, setSeconds] = useState(0);
  const [bestTime, setBestTimeState] = useState<number | null>(null);

  const mines = mode.mines;
  const rows = mode.rows;
  const cols = mode.cols;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const secondsRef = useRef(0);
  secondsRef.current = seconds;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
  }, []);

  const startGame = useCallback(
    (selectedMode?: GameMode) => {
      const m = selectedMode ?? mode;
      clearTimer();
      setBoard(createEmptyBoard(m.rows, m.cols));
      setFlagsUsed(0);
      setSeconds(0);
      setPhase("playing");
      setFace("normal");
      startedRef.current = false;
      setBestTimeState(getStoredBestTime(getModeKey(m)));
    },
    [mode, clearTimer]
  );

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const handleRevealResult = useCallback(
    (status: RevealStatus) => {
      if (status === "lost") {
        setPhase("lost");
        setFace("lost");
        clearTimer();
      } else if (status === "won") {
        setPhase("won");
        setFace("won");
        clearTimer();
        const key = getModeKey(mode);
        const sec = secondsRef.current;
        const current = getStoredBestTime(key);
        if (current === null || sec < current) {
          persistBestTime(key, sec);
          setBestTimeState(sec);
        }
      }
    },
    [mode, clearTimer]
  );

  const reveal = useCallback(
    (r: number, c: number) => {
      const isFirst = !startedRef.current;
      if (isFirst) {
        startedRef.current = true;
        startTimer();
      }
      let status: RevealStatus = "ok";
      setBoard((prev) => {
        const cell = prev[r]?.[c];
        if (!cell || cell.state !== "hidden" || cell.mark === "flag") return prev;
        const result = computeReveal(prev, [[r, c]], isFirst, isFirst ? [r, c] : null, mines);
        status = result.status;
        return result.board;
      });
      if (status !== "ok") handleRevealResult(status);
    },
    [mines, startTimer, handleRevealResult]
  );

  const chord = useCallback(
    (r: number, c: number) => {
      let status: RevealStatus = "ok";
      setBoard((prev) => {
        const cell = prev[r]?.[c];
        if (!cell || cell.state !== "revealed" || cell.neighborMines === 0) return prev;
        let flagCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < prev.length && nc >= 0 && nc < prev[0].length && prev[nr][nc].mark === "flag")
              flagCount++;
          }
        }
        if (flagCount !== cell.neighborMines) return prev;
        const toReveal: [number, number][] = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < prev.length &&
              nc >= 0 &&
              nc < prev[0].length &&
              prev[nr][nc].state === "hidden" &&
              prev[nr][nc].mark !== "flag"
            )
              toReveal.push([nr, nc]);
          }
        }
        if (toReveal.length === 0) return prev;
        const result = computeReveal(prev, toReveal, false, null, mines);
        status = result.status;
        return result.board;
      });
      if (status !== "ok") handleRevealResult(status);
    },
    [mines, handleRevealResult]
  );

  const cycleMark = useCallback(
    (r: number, c: number) => {
      setBoard((prev) => {
        const cell = prev[r]?.[c];
        if (!cell || cell.state !== "hidden") return prev;
        const next = deepCopyBoard(prev);
        const cycle: CellMark[] = ["none", "flag", "question"];
        const currentMark = cell.mark;
        const nextMark = cycle[(cycle.indexOf(currentMark) + 1) % 3];
        next[r][c].mark = nextMark;
        const flagDelta = (nextMark === "flag" ? 1 : 0) - (currentMark === "flag" ? 1 : 0);
        if (flagDelta !== 0) setFlagsUsed((f) => f + flagDelta);
        return next;
      });
    },
    []
  );

  const handleCellLeft = useCallback(
    (r: number, c: number) => {
      if (phase !== "playing") return;
      reveal(r, c);
    },
    [phase, reveal]
  );

  const handleCellRight = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (phase !== "playing") return;
      const cell = board[r]?.[c];
      if (cell?.state === "revealed") {
        chord(r, c);
      } else if (cell?.state === "hidden") {
        cycleMark(r, c);
      }
    },
    [phase, board, chord, cycleMark]
  );

  const applyCustom = useCallback(() => {
    const r = Math.max(MIN_ROWS, Math.min(MAX_ROWS, customRows));
    const c = Math.max(MIN_COLS, Math.min(MAX_COLS, customCols));
    const maxM = maxMines(r, c);
    const m = Math.max(MIN_MINES, Math.min(maxM, customMines));
    setCustomRows(r);
    setCustomCols(c);
    setCustomMines(m);
    const newMode: GameMode = { id: "custom", rows: r, cols: c, mines: m };
    setMode(newMode);
    startGame(newMode);
  }, [customRows, customCols, customMines, startGame]);

  const riskPercent = ((mines / (rows * cols)) * 100).toFixed(1);
  const mineCounter = mines - flagsUsed;

  const [cellSize, setCellSize] = useState(CELL_SIZE_DESKTOP);
  useEffect(() => {
    const update = () =>
      setCellSize(window.innerWidth < 640 ? CELL_SIZE_MOBILE : CELL_SIZE_DESKTOP);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="font-mono text-2xl font-semibold text-foreground">
        {t("title")}
      </h1>

      {phase === "select" && (
        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-5 space-y-2 text-sm text-muted-foreground">
            <p>{t("instructions")}</p>
            <p>{t("flagInstructions")}</p>
          </div>
          <h2 className="mb-4 text-center font-mono text-lg font-medium">
            {t("selectMode")}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {PRESET_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m);
                  startGame(m);
                }}
                className="rounded border border-border bg-muted px-4 py-2 font-mono text-sm text-foreground hover:bg-accent"
              >
                {t(`mode.${m.id}`)} ({m.rows}×{m.cols}, {m.mines} {t("mines")})
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-3 text-center font-mono text-sm font-medium">
              {t("customMode")}
            </h3>
            <div className="flex flex-wrap items-end justify-center gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t("rows")}</span>
                <input
                  type="number"
                  min={MIN_ROWS}
                  max={MAX_ROWS}
                  value={customRows}
                  onChange={(e) => setCustomRows(parseInt(e.target.value, 10) || MIN_ROWS)}
                  className="w-20 rounded border border-border bg-background px-2 py-1 font-mono text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t("cols")}</span>
                <input
                  type="number"
                  min={MIN_COLS}
                  max={MAX_COLS}
                  value={customCols}
                  onChange={(e) => setCustomCols(parseInt(e.target.value, 10) || MIN_COLS)}
                  className="w-20 rounded border border-border bg-background px-2 py-1 font-mono text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t("mines")}</span>
                <input
                  type="number"
                  min={MIN_MINES}
                  max={maxMines(customRows, customCols)}
                  value={customMines}
                  onChange={(e) =>
                    setCustomMines(
                      Math.min(
                        maxMines(customRows, customCols),
                        parseInt(e.target.value, 10) || MIN_MINES
                      )
                    )
                  }
                  className="w-20 rounded border border-border bg-background px-2 py-1 font-mono text-sm"
                />
              </label>
              <button
                type="button"
                onClick={applyCustom}
                className="rounded border border-border bg-muted px-4 py-2 font-mono text-sm text-foreground hover:bg-accent"
              >
                {t("startCustom")}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t("customRules")} {MIN_MINES}–{maxMines(customRows, customCols)}.{" "}
              {t("risk")}: {riskPercent}%
            </p>
          </div>
        </div>
      )}

      {(phase === "playing" || phase === "won" || phase === "lost") && (
        <>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setPhase("select");
                clearTimer();
              }}
              className="rounded border border-border bg-muted px-3 py-1 font-mono text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t("changeMode")}
            </button>
            <div className="flex items-center gap-6 font-mono text-sm">
              <span className="tabular-nums">
                💣 {mineCounter}
              </span>
              <span className="tabular-nums">
                ⏱ {formatTime(seconds)}
              </span>
              {bestTime != null && (
                <span className="text-muted-foreground">
                  🏆 {formatTime(bestTime)}
                </span>
              )}
            </div>
          </div>

          <div
            className="inline-flex flex-col items-center overflow-auto rounded-lg border border-border bg-card p-3 shadow-sm"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="mb-2">
              <button
                type="button"
                onClick={() => startGame()}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-2xl shadow-sm hover:bg-accent"
                aria-label={t("restart")}
              >
                {face === "lost" ? "😵" : face === "won" ? "😎" : face === "click" ? "😮" : "😊"}
              </button>
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <CellButton
                    key={`${r}-${c}`}
                    cell={cell}
                    cellSize={cellSize}
                    playing={phase === "playing"}
                    onLeft={() => handleCellLeft(r, c)}
                    onRight={(e) => handleCellRight(e, r, c)}
                    onMouseDown={() => phase === "playing" && setFace("click")}
                    onMouseUp={() => setFace((f) => (f === "click" ? "normal" : f))}
                  />
                ))
              )}
            </div>
          </div>

          {(phase === "won" || phase === "lost") && (
            <div
              className={`w-full max-w-sm rounded-lg border p-6 text-center shadow-sm ${
                phase === "won"
                  ? "border-green-500/30 bg-green-50 dark:bg-green-950/30"
                  : "border-red-500/30 bg-red-50 dark:bg-red-950/30"
              }`}
            >
              <p className="text-4xl">{phase === "won" ? "😎" : "😵"}</p>
              <p
                className={`mt-2 font-mono text-lg font-semibold ${
                  phase === "won"
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {phase === "won" ? t("youWon") : t("youLost")}
              </p>
              {phase === "won" && (
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {t("yourTime")}: {formatTime(seconds)}
                  {bestTime != null && seconds <= bestTime && (
                    <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                      {t("newRecord")}
                    </span>
                  )}
                </p>
              )}
              <button
                type="button"
                onClick={() => startGame()}
                className="mt-4 rounded border border-border bg-muted px-6 py-2 font-mono text-sm text-foreground hover:bg-accent"
              >
                {t("playAgain")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CellButton({
  cell,
  cellSize,
  playing,
  onLeft,
  onRight,
  onMouseDown,
  onMouseUp,
}: {
  cell: Cell;
  cellSize: number;
  playing: boolean;
  onLeft: () => void;
  onRight: (e: React.MouseEvent) => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
}) {
  const isHidden = cell.state === "hidden";
  return (
    <button
      type="button"
      className={
        isHidden
          ? "flex items-center justify-center border border-b-2 border-l-[hsl(var(--border)/0.5)] border-r-[hsl(var(--border))] border-t-[hsl(var(--border)/0.5)] border-b-[hsl(var(--border))] bg-muted text-sm font-bold shadow-[inset_1px_1px_0_rgba(255,255,255,0.15)] hover:brightness-110 active:shadow-none"
          : "flex items-center justify-center border border-[hsl(var(--border)/0.3)] bg-background text-sm font-bold"
      }
      style={{ width: cellSize, height: cellSize, minWidth: cellSize, minHeight: cellSize, fontSize: cellSize * 0.45 }}
      onClick={onLeft}
      onContextMenu={onRight}
      onMouseDown={playing ? onMouseDown : undefined}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <CellContent cell={cell} />
    </button>
  );
}

function CellContent({ cell }: { cell: Cell }) {
  if (cell.state === "hidden") {
    if (cell.mark === "flag") return <span>🚩</span>;
    if (cell.mark === "question") return <span>❓</span>;
    return null;
  }
  if (cell.state === "mine")
    return <span>💣</span>;
  if (cell.state === "wrong-flag")
    return <span className="text-red-600 dark:text-red-400">❌</span>;
  if (cell.state === "revealed") {
    if (cell.neighborMines === 0) return null;
    return (
      <span style={{ color: NUMBER_COLORS[cell.neighborMines] }}>
        {cell.neighborMines}
      </span>
    );
  }
  return null;
}
