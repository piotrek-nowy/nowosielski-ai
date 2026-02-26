'use client';

import React, { memo } from 'react';
import { GameState } from '@/lib/solitaire/types';

interface HeaderProps {
  state: GameState;
  onNewGame: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const Header = memo(function Header({ state, onNewGame }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="flex items-center gap-6">
        <h1 className="text-white font-bold text-lg tracking-wide">Solitaire</h1>

        <div className="flex items-center gap-4 text-sm">
          <Stat label="Score" value={state.score.toString()} />
          <Stat label="Moves" value={state.moves.toString()} />
          <Stat label="Time" value={formatTime(state.timeElapsed)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-green-300/70 bg-green-900/30 px-2 py-0.5 rounded">
          Draw {state.drawMode}
        </span>

        {state.gameStatus === 'idle' ? (
          <button
            onClick={onNewGame}
            className="bg-white/90 hover:bg-white text-green-900 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
          >
            New Game
          </button>
        ) : (
          <button
            onClick={onNewGame}
            className="text-green-200/70 hover:text-white text-sm px-3 py-1 rounded border border-green-600/30 hover:border-green-500/50 transition-colors"
          >
            Restart
          </button>
        )}
      </div>
    </div>
  );
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-green-100/80">
      <span className="text-green-400/60 text-xs uppercase tracking-wider">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

export default Header;
