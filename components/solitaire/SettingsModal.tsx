'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  drawMode: 1 | 3;
  gameStatus: 'idle' | 'playing' | 'paused' | 'won';
  onClose: () => void;
  onChangeDrawMode: (mode: 1 | 3) => void;
  onNewGame: () => void;
}

const SettingsModal = memo(function SettingsModal({
  isOpen,
  drawMode,
  gameStatus,
  onClose,
  onChangeDrawMode,
  onNewGame,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-green-950 border border-green-700/50 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h2 className="text-white font-bold text-lg mb-5">Settings</h2>

              <div className="space-y-5">
                {/* Draw mode */}
                <div>
                  <label className="text-green-300/80 text-sm block mb-2">
                    Draw Mode
                  </label>
                  <div className="flex gap-2">
                    <DrawModeButton
                      mode={1}
                      active={drawMode === 1}
                      disabled={gameStatus === 'playing'}
                      onClick={() => onChangeDrawMode(1)}
                    />
                    <DrawModeButton
                      mode={3}
                      active={drawMode === 3}
                      disabled={gameStatus === 'playing'}
                      onClick={() => onChangeDrawMode(3)}
                    />
                  </div>
                  {gameStatus === 'playing' && (
                    <p className="text-green-500/50 text-xs mt-1">
                      Start a new game to change draw mode
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onNewGame();
                      onClose();
                    }}
                    className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    New Game
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-green-400/70 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

function DrawModeButton({
  mode,
  active,
  disabled,
  onClick,
}: {
  mode: 1 | 3;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 py-2 rounded-lg text-sm font-medium transition-all
        ${active
          ? 'bg-green-600 text-white'
          : 'bg-green-900/50 text-green-400/60 hover:text-green-300/80'
        }
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      Draw {mode}
    </button>
  );
}

export default SettingsModal;
