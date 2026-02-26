'use client';

import React, { memo } from 'react';

interface SidePanelProps {
  gameStatus: 'idle' | 'playing' | 'paused' | 'won';
  undosRemaining: number;
  hintsRemaining: number;
  canAutoComplete: boolean;
  onPause: () => void;
  onResume: () => void;
  onUndo: () => void;
  onHint: () => void;
  onSettings: () => void;
  onAutoComplete: () => void;
}

const SidePanel = memo(function SidePanel({
  gameStatus,
  undosRemaining,
  hintsRemaining,
  canAutoComplete,
  onPause,
  onResume,
  onUndo,
  onHint,
  onSettings,
  onAutoComplete,
}: SidePanelProps) {
  const isPlaying = gameStatus === 'playing';
  const isPaused = gameStatus === 'paused';

  return (
    <>
      {/* Desktop: vertical side panel */}
      <div className="hidden lg:flex flex-col gap-3 items-center">
        {isPaused ? (
          <PanelButton icon="▶" label="Resume" onClick={onResume} />
        ) : (
          <PanelButton icon="⏸" label="Pause" onClick={onPause} disabled={!isPlaying} />
        )}

        <PanelButton
          icon="↩"
          label="Undo"
          badge={undosRemaining}
          onClick={onUndo}
          disabled={!isPlaying || undosRemaining <= 0}
        />

        <PanelButton
          icon="💡"
          label="Hint"
          badge={hintsRemaining}
          onClick={onHint}
          disabled={!isPlaying || hintsRemaining <= 0}
        />

        {canAutoComplete && (
          <PanelButton
            icon="⚡"
            label="Auto"
            onClick={onAutoComplete}
            highlight
          />
        )}

        <div className="w-8 border-t border-green-600/30 my-1" />

        <PanelButton icon="⚙" label="Settings" onClick={onSettings} />
      </div>

      {/* Mobile: bottom toolbar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-green-950/95 backdrop-blur border-t border-green-800/50 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {isPaused ? (
            <ToolbarButton icon="▶" label="Resume" onClick={onResume} />
          ) : (
            <ToolbarButton icon="⏸" label="Pause" onClick={onPause} disabled={!isPlaying} />
          )}

          <ToolbarButton
            icon="↩"
            label="Undo"
            badge={undosRemaining}
            onClick={onUndo}
            disabled={!isPlaying || undosRemaining <= 0}
          />

          <ToolbarButton
            icon="💡"
            label="Hint"
            badge={hintsRemaining}
            onClick={onHint}
            disabled={!isPlaying || hintsRemaining <= 0}
          />

          {canAutoComplete && (
            <ToolbarButton icon="⚡" label="Auto" onClick={onAutoComplete} />
          )}

          <ToolbarButton icon="⚙" label="Settings" onClick={onSettings} />
        </div>
      </div>
    </>
  );
});

function PanelButton({
  icon,
  label,
  badge,
  onClick,
  disabled = false,
  highlight = false,
}: {
  icon: string;
  label: string;
  badge?: number;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        relative w-12 h-12 rounded-full flex items-center justify-center
        text-lg transition-all
        ${highlight
          ? 'bg-yellow-500/80 hover:bg-yellow-500 text-green-900'
          : 'bg-green-900/60 hover:bg-green-800/80 text-green-200/80 hover:text-white'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function ToolbarButton({
  icon,
  label,
  badge,
  onClick,
  disabled = false,
}: {
  icon: string;
  label: string;
  badge?: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center gap-0.5 px-3 py-1
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="text-lg text-green-200/80">{icon}</span>
      <span className="text-[10px] text-green-400/60">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

export default SidePanel;
