'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useGameState } from '@/hooks/solitaire/useGameState';
import { useTimer } from '@/hooks/solitaire/useTimer';
import { useHint } from '@/hooks/solitaire/useHint';
import { useAutoComplete } from '@/hooks/solitaire/useAutoComplete';
import { CardLocation, DragInfo, HintMove, DropTarget, GameState } from '@/lib/solitaire/types';
import { getCardsToMove, isValidMove } from '@/lib/solitaire/moves';
import Header from './Header';
import Foundation from './Foundation';
import StockAndWaste from './StockAndWaste';
import Tableau from './Tableau';
import SidePanel from './SidePanel';
import DragLayer from './DragLayer';
import WinScreen from './WinScreen';
import SettingsModal from './SettingsModal';

function parseDropZone(zone: string): DropTarget | null {
  const [pile, idxStr] = zone.split('-');
  const index = parseInt(idxStr, 10);
  if (pile === 'tableau') return { pile: 'tableau', index };
  if (pile === 'foundation') return { pile: 'foundation', index };
  return null;
}

function findDropZoneAt(x: number, y: number): string | null {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    const zone = (el as HTMLElement).dataset?.dropZone;
    if (zone) return zone;
  }
  return null;
}

export default function SolitaireGame() {
  const { state, dispatch, newGame, canAutoComplete: canAuto } = useGameState();
  const { getHint } = useHint(state);

  const [selectedCard, setSelectedCard] = useState<CardLocation | null>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [hintMove, setHintMove] = useState<HintMove | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoCompleting, setAutoCompleting] = useState(false);

  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to avoid stale closures in document-level event listeners
  const dragInfoRef = useRef<DragInfo | null>(null);
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;
  const selectedCardRef = useRef<CardLocation | null>(null);
  selectedCardRef.current = selectedCard;

  useTimer(state.gameStatus === 'playing', () => dispatch({ type: 'TICK' }));
  useAutoComplete(state, dispatch, autoCompleting);

  useEffect(() => {
    if (state.gameStatus === 'won') setAutoCompleting(false);
  }, [state.gameStatus]);

  // ── Global pointer listeners for drag & drop ───────────────────

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragInfoRef.current) return;
      setDragPos({ x: e.clientX, y: e.clientY });
      const zone = findDropZoneAt(e.clientX, e.clientY);
      setActiveDropZone(zone);
    }

    function onPointerUp(e: PointerEvent) {
      const info = dragInfoRef.current;
      if (!info) return;

      const zoneId = findDropZoneAt(e.clientX, e.clientY);
      if (zoneId) {
        const target = parseDropZone(zoneId);
        if (target && isValidMove(stateRef.current, info.source, target)) {
          dispatch({ type: 'MOVE_CARDS', from: info.source, to: target });
          setSelectedCard(null);
        }
      }

      dragInfoRef.current = null;
      setDragInfo(null);
      setActiveDropZone(null);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [dispatch]);

  // ── Hint ───────────────────────────────────────────────────────

  const clearHint = useCallback(() => {
    setHintMove(null);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
  }, []);

  const handleHint = useCallback(() => {
    if (stateRef.current.hintsRemaining <= 0) return;
    const hint = getHint();
    if (hint) {
      setHintMove(hint);
      hintTimeoutRef.current = setTimeout(() => setHintMove(null), 3000);
    }
  }, [getHint]);

  // ── Start drag ─────────────────────────────────────────────────

  const startDrag = useCallback((e: React.PointerEvent, loc: CardLocation) => {
    const cards = getCardsToMove(stateRef.current, loc);
    if (!cards || cards.length === 0) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const info: DragInfo = { cards, source: loc };
    dragInfoRef.current = info;

    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragInfo(info);
    setSelectedCard(null);
    clearHint();
  }, [clearHint]);

  // ── Click Handling ─────────────────────────────────────────────

  const handleCardClick = useCallback((loc: CardLocation) => {
    if (dragInfoRef.current) return;
    clearHint();

    const prev = selectedCardRef.current;
    if (prev) {
      if (prev.pile === loc.pile && prev.index === loc.index && prev.cardIndex === loc.cardIndex) {
        setSelectedCard(null);
        return;
      }
      const target: DropTarget = { pile: loc.pile, index: loc.index };
      if (isValidMove(stateRef.current, prev, target)) {
        dispatch({ type: 'MOVE_CARDS', from: prev, to: target });
        setSelectedCard(null);
        return;
      }
    }
    setSelectedCard(loc);
  }, [dispatch, clearHint]);

  const handleCardDoubleClick = useCallback((loc: CardLocation) => {
    clearHint();
    const currentState = stateRef.current;
    for (let f = 0; f < 4; f++) {
      const target: DropTarget = { pile: 'foundation', index: f };
      if (isValidMove(currentState, loc, target)) {
        dispatch({ type: 'MOVE_CARDS', from: loc, to: target });
        setSelectedCard(null);
        return;
      }
    }
  }, [dispatch, clearHint]);

  const handleStockClick = useCallback(() => {
    clearHint();
    setSelectedCard(null);
    const s = stateRef.current;
    if (s.stock.length > 0) {
      dispatch({ type: 'DRAW_STOCK' });
    } else if (s.waste.length > 0) {
      dispatch({ type: 'RECYCLE_WASTE' });
    }
  }, [dispatch, clearHint]);

  // ── Side Panel Actions ─────────────────────────────────────────

  const handlePause = useCallback(() => dispatch({ type: 'PAUSE' }), [dispatch]);
  const handleResume = useCallback(() => dispatch({ type: 'RESUME' }), [dispatch]);
  const handleUndo = useCallback(() => {
    clearHint();
    dispatch({ type: 'UNDO' });
  }, [dispatch, clearHint]);
  const handleAutoComplete = useCallback(() => setAutoCompleting(true), []);
  const handleDrawModeChange = useCallback(
    (mode: 1 | 3) => dispatch({ type: 'SET_DRAW_MODE', mode }),
    [dispatch]
  );

  // ── Idle screen ────────────────────────────────────────────────

  if (state.gameStatus === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a5c2a] to-[#0d3d1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">♠♥♦♣</div>
          <h1 className="text-white font-bold text-3xl mb-2">Solitaire</h1>
          <p className="text-green-300/60 mb-8">Klondike</p>

          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={() => handleDrawModeChange(1)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                state.drawMode === 1
                  ? 'bg-green-600 text-white'
                  : 'bg-green-900/50 text-green-400/60 hover:text-green-300'
              }`}
            >
              Draw 1
            </button>
            <button
              onClick={() => handleDrawModeChange(3)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                state.drawMode === 3
                  ? 'bg-green-600 text-white'
                  : 'bg-green-900/50 text-green-400/60 hover:text-green-300'
              }`}
            >
              Draw 3
            </button>
          </div>

          <button
            onClick={newGame}
            className="bg-white hover:bg-gray-100 text-green-900 font-bold text-lg px-10 py-3 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            Deal Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a5c2a] to-[#0d3d1a] select-none">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 pb-20 lg:pb-4">
        <Header state={state} onNewGame={newGame} />

        <LayoutGroup>
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <Foundation
                  piles={state.foundation}
                  onCardClick={handleCardClick}
                  onCardDoubleClick={handleCardDoubleClick}
                  onCardPointerDown={startDrag}
                  selectedCard={selectedCard}
                  activeDropZone={activeDropZone}
                  hintMove={hintMove}
                />
                <StockAndWaste
                  stock={state.stock}
                  waste={state.waste}
                  drawMode={state.drawMode}
                  onStockClick={handleStockClick}
                  onWasteCardClick={handleCardClick}
                  onWasteCardDoubleClick={handleCardDoubleClick}
                  onWasteCardPointerDown={startDrag}
                  selectedCard={selectedCard}
                  hintMove={hintMove}
                />
              </div>

              {/* Tableau */}
              <Tableau
                columns={state.tableau}
                onCardClick={handleCardClick}
                onCardDoubleClick={handleCardDoubleClick}
                onCardPointerDown={startDrag}
                selectedCard={selectedCard}
                activeDropZone={activeDropZone}
                hintMove={hintMove}
                dragSource={dragInfo?.source ?? null}
                dragCardIndex={dragInfo?.source.cardIndex ?? 0}
              />
            </div>

            {/* Side panel (desktop) */}
            <SidePanel
              gameStatus={state.gameStatus}
              undosRemaining={state.undosRemaining}
              hintsRemaining={state.hintsRemaining}
              canAutoComplete={canAuto}
              onPause={handlePause}
              onResume={handleResume}
              onUndo={handleUndo}
              onHint={handleHint}
              onSettings={() => setShowSettings(true)}
              onAutoComplete={handleAutoComplete}
            />
          </div>
        </LayoutGroup>
      </div>

      {/* Drag overlay */}
      {dragInfo && (
        <DragLayer
          cards={dragInfo.cards}
          position={dragPos}
          offset={dragOffset}
        />
      )}

      {/* Pause overlay */}
      {state.gameStatus === 'paused' && (
        <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl font-bold mb-4">Game Paused</div>
            <button
              onClick={handleResume}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Win screen */}
      {state.gameStatus === 'won' && (
        <WinScreen
          score={state.score}
          timeElapsed={state.timeElapsed}
          moves={state.moves}
          onNewGame={newGame}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        drawMode={state.drawMode}
        gameStatus={state.gameStatus}
        onClose={() => setShowSettings(false)}
        onChangeDrawMode={handleDrawModeChange}
        onNewGame={newGame}
      />
    </div>
  );
}
