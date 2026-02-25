"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 20;
const CELL_PX = 25;
const CANVAS_SIZE = GRID_SIZE * CELL_PX;
const INITIAL_SPEED_MS = 125;
const SPEED_BONUS_MS = 8;
const POINTS_PER_LEVEL = 5;

type Dir = "up" | "down" | "left" | "right";
type Point = { x: number; y: number };

const STORAGE_KEY = "snake-best-score";

function getBestScore(): number {
  if (typeof window === "undefined") return 0;
  const s = localStorage.getItem(STORAGE_KEY);
  return s ? parseInt(s, 10) : 0;
}

function setBestScore(score: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(score));
}

export function SnakeGame() {
  const t = useTranslations("snake");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const gameRef = useRef<{
    snake: Point[];
    dir: Dir;
    nextDir: Dir;
    food: Point;
    intervalId: ReturnType<typeof setInterval> | null;
  } | null>(null);

  const placeFood = useCallback((snake: Point[]): Point => {
    const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (occupied.has(`${x},${y}`));
    return { x, y };
  }, []);

  const draw = useCallback(() => {
    const g = gameRef.current;
    const canvas = canvasRef.current;
    if (!g || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { snake, food } = g;
    const w = CANVAS_SIZE;
    const h = CANVAS_SIZE;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_PX, 0);
      ctx.lineTo(i * CELL_PX, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_PX);
      ctx.lineTo(w, i * CELL_PX);
      ctx.stroke();
    }

    ctx.fillStyle = "#FF5252";
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_PX + CELL_PX / 2,
      food.y * CELL_PX + CELL_PX / 2,
      CELL_PX / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    snake.forEach((p, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? "#6ee7b7" : "#4ade80";
      const pad = isHead ? 1 : 2;
      ctx.fillRect(
        p.x * CELL_PX + pad,
        p.y * CELL_PX + pad,
        CELL_PX - pad * 2,
        CELL_PX - pad * 2
      );
    });
  }, []);

  const startGame = useCallback(() => {
    const head: Point = {
      x: Math.floor(GRID_SIZE / 2),
      y: Math.floor(GRID_SIZE / 2),
    };
    const snake: Point[] = [
      head,
      { x: head.x - 1, y: head.y },
      { x: head.x - 2, y: head.y },
    ];
    const food = placeFood(snake);
    const dir: Dir = "right";
    setScore(0);
    setBest(getBestScore());
    setPhase("playing");
    gameRef.current = {
      snake,
      dir,
      nextDir: dir,
      food,
      intervalId: null,
    };
  }, [placeFood]);

  // Single game loop: when phase is "playing", run interval; restart when score changes (faster speed every 5 pts)
  useEffect(() => {
    if (phase !== "playing" || !gameRef.current || !canvasRef.current) {
      if (gameRef.current?.intervalId) {
        clearInterval(gameRef.current.intervalId);
        gameRef.current.intervalId = null;
      }
      return;
    }

    const g = gameRef.current;

    const tick = () => {
      const state = gameRef.current;
      if (!state) return;

      state.dir = state.nextDir;
      const head = state.snake[0];
      let nx = head.x;
      let ny = head.y;
      switch (state.dir) {
        case "up":
          ny--;
          break;
        case "down":
          ny++;
          break;
        case "left":
          nx--;
          break;
        case "right":
          nx++;
          break;
      }

      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
        if (state.intervalId) clearInterval(state.intervalId);
        state.intervalId = null;
        const currentScore = scoreRef.current;
        const newBest = Math.max(currentScore, getBestScore());
        setBest(newBest);
        setBestScore(newBest);
        setPhase("gameover");
        return;
      }

      if (state.snake.some((p) => p.x === nx && p.y === ny)) {
        if (state.intervalId) clearInterval(state.intervalId);
        state.intervalId = null;
        const currentScore = scoreRef.current;
        const newBest = Math.max(currentScore, getBestScore());
        setBest(newBest);
        setBestScore(newBest);
        setPhase("gameover");
        return;
      }

      const newHead = { x: nx, y: ny };
      state.snake.unshift(newHead);

      if (nx === state.food.x && ny === state.food.y) {
        setScore((s) => s + 1);
        state.food = placeFood(state.snake);
      } else {
        state.snake.pop();
      }

      draw();
    };

    if (g.intervalId) {
      clearInterval(g.intervalId);
      g.intervalId = null;
    }

    draw();

    const speedMs = Math.max(
      50,
      INITIAL_SPEED_MS -
        Math.floor(score / POINTS_PER_LEVEL) * SPEED_BONUS_MS
    );
    g.intervalId = setInterval(tick, speedMs);

    return () => {
      if (g.intervalId) {
        clearInterval(g.intervalId);
        g.intervalId = null;
      }
    };
  }, [phase, score, placeFood, draw]);

  // Listener na document — strzałki nie przewiną strony i działają bez focusa na grze
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
      }
      const g = gameRef.current;
      if (phase === "start" && e.key === "Enter") {
        startGame();
        return;
      }
      if (phase === "playing" && g) {
        switch (e.key) {
          case "ArrowUp":
            if (g.dir !== "down") g.nextDir = "up";
            break;
          case "ArrowDown":
            if (g.dir !== "up") g.nextDir = "down";
            break;
          case "ArrowLeft":
            if (g.dir !== "right") g.nextDir = "left";
            break;
          case "ArrowRight":
            if (g.dir !== "left") g.nextDir = "right";
            break;
        }
      }
    };
    document.addEventListener("keydown", handler, { capture: true });
    return () =>
      document.removeEventListener("keydown", handler, { capture: true });
  }, [phase, startGame]);

  useEffect(() => {
    setBest(getBestScore());
  }, []);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-8">
      <div className="flex w-full max-w-[500px] items-center justify-between font-mono text-sm text-muted-foreground">
        <span>
          {t("score")}: <strong className="text-foreground">{score}</strong>
        </span>
        <span>
          {t("best")}: <strong className="text-foreground">{best}</strong>
        </span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="max-h-[500px] max-w-[500px] rounded-lg border border-border shadow-lg"
          style={{ width: "100%", height: "auto", aspectRatio: "1" }}
        />
        {phase === "start" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/90 font-sans"
            style={{
              aspectRatio: "1",
              maxWidth: CANVAS_SIZE,
              maxHeight: CANVAS_SIZE,
            }}
          >
            <p className="text-center text-lg font-medium text-foreground">
              {t("pressEnter")}
            </p>
            <Button onClick={startGame} variant="default">
              {t("start")}
            </Button>
          </div>
        )}
        {phase === "gameover" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/90 font-sans"
            style={{
              aspectRatio: "1",
              maxWidth: CANVAS_SIZE,
              maxHeight: CANVAS_SIZE,
            }}
          >
            <p className="text-center text-lg font-medium text-foreground">
              {t("gameOver")}
            </p>
            <p className="font-mono text-muted-foreground">
              {t("score")}: <strong className="text-foreground">{score}</strong>
            </p>
            <Button onClick={startGame}>{t("playAgain")}</Button>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <p className="text-center font-mono text-xs text-muted-foreground">
          ← ↑ → ↓
        </p>
      )}
    </div>
  );
}
